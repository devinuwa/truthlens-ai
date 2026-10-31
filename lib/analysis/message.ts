import { buildSafetyBrief } from "@/lib/analysis/case";
import {
  CONFIDENCE_MEANING,
  type AnalysisContext,
  type AnalysisResult,
  type Assessment,
  type Indicator,
  type IndicatorStrength,
  type MessageCategory,
  type ModelNote,
  type SafetyBrief,
} from "@/lib/analysis/types";

const FOCUS_LABELS: Record<Exclude<MessageCategory, "auto">, string> = {
  scam: "Scam language",
  phishing: "Phishing and passwords",
  fake_opportunity: "Fake scholarship or job",
  payment_or_personal_information: "Money or personal details",
  urgency: "Pressure and urgency",
  harassment: "Harassment",
  manipulation: "Manipulation",
};

const INDICATOR_CATEGORY: Record<string, Indicator["category"]> = {
  "credential-request": "phishing",
  "account-threat": "phishing",
  "payment-request": "payment_or_personal_information",
  "unspecified-payment": "payment_or_personal_information",
  "unexpected-selection": "fake_opportunity",
  "impersonation-claim": "scam",
  secrecy: "manipulation",
  "private-photo": "manipulation",
  threat: "harassment",
  insult: "harassment",
  urgency: "urgency",
};

export function analyzeMessage(
  text: string,
  focus: MessageCategory = "auto",
  model?: ModelNote,
  context?: AnalysisContext,
): AnalysisResult {
  const brief = buildSafetyBrief(text, context);
  const assessment = assessmentFor(brief.risk);
  const focusNote =
    focus === "auto"
      ? "The check looked at the request, the pressure, any link, and what the message does not prove."
      : `You asked to focus on ${FOCUS_LABELS[focus]}. The other checks still ran.`;

  return {
    kind: "message",
    assessment,
    assessmentLabel: brief.riskLabel,
    confidence: {
      level: brief.confidence,
      meaning: CONFIDENCE_MEANING,
    },
    categoriesConsidered: [
      "Phishing",
      "Payments and fees",
      "Scholarships and jobs",
      "Impersonation",
      "Links",
      "Secrecy and pressure",
      "Harassment",
    ],
    focusCategory: focus,
    indicators: indicatorsFrom(brief),
    recommendedActions: brief.actions,
    limitations: `${brief.limitations} ${focusNote}`,
    model: model ?? {
      status: "unavailable",
      provider: "rules",
      note: "No AI reading was added. The assessment above is from the built-in checks only.",
    },
    brief,
  };
}

export function detectMessageIndicators(text: string): Indicator[] {
  return indicatorsFrom(buildSafetyBrief(text));
}

export function applyModelReading(result: AnalysisResult, model: ModelNote, interpretation: string | null): AnalysisResult {
  if (!result.brief) return { ...result, model };
  const scored = model.status === "scored" && Boolean(interpretation);
  return {
    ...result,
    model,
    brief: {
      ...result.brief,
      interpretation: scored ? interpretation : null,
      source: scored ? "rules_and_model" : "rules",
    },
  };
}

function assessmentFor(risk: SafetyBrief["risk"]): Assessment {
  if (risk === "high" || risk === "medium") return "suspicious_indicators_found";
  if (risk === "low") return "no_major_indicators";
  return "insufficient_evidence";
}

function indicatorsFrom(brief: SafetyBrief): Indicator[] {
  return brief.evidence
    .filter((item) => item.id !== "protective-secret" && item.kind === "fact")
    .map((item) => ({
      id: item.id,
      category: INDICATOR_CATEGORY[item.id] ?? "scam",
      title: item.title,
      explanation: item.detail,
      evidence: item.quote ?? "",
      strength: strengthFor(item.id),
    }));
}

function strengthFor(id: string): IndicatorStrength {
  if (id === "insult" || id === "unspecified-payment" || id === "urgency") return id === "insult" ? "weak" : "moderate";
  if (id === "unexpected-selection" || id === "account-threat" || id === "impersonation-claim" || id === "shortener") return "moderate";
  return "strong";
}
