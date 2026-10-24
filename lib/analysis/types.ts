export const MESSAGE_CATEGORIES = [
  "auto",
  "scam",
  "phishing",
  "fake_opportunity",
  "payment_or_personal_information",
  "urgency",
  "harassment",
  "manipulation",
] as const;

export type MessageCategory = (typeof MESSAGE_CATEGORIES)[number];

export type IndicatorStrength = "weak" | "moderate" | "strong";

export type Assessment =
  | "suspicious_indicators_found"
  | "no_major_indicators"
  | "insufficient_evidence";

export type ConfidenceLevel = "low" | "medium" | "high";

export type Indicator = {
  id: string;
  category: Exclude<MessageCategory, "auto">;
  title: string;
  explanation: string;
  evidence: string;
  strength: IndicatorStrength;
};

export type ModelNote = {
  status: "unavailable" | "scored" | "error";
  note: string;
  label?: string;
  score?: number;
};

export type AnalysisResult = {
  kind: "message" | "url";
  assessment: Assessment;
  assessmentLabel: string;
  confidence: {
    level: ConfidenceLevel | null;
    meaning: string;
  };
  categoriesConsidered: string[];
  focusCategory: MessageCategory | "url";
  indicators: Indicator[];
  recommendedActions: string[];
  limitations: string;
  model: ModelNote;
};

export const CONFIDENCE_MEANING =
  "This level describes how strongly the listed language or link patterns showed up. It is not a probability that something is a confirmed scam, and it is not a promise that an item is safe.";

export const BASE_LIMITATION =
  "TruthLens looks for warning signs. A matching pattern is a warning sign, not proof that fraud or abuse has been confirmed. It cannot see who sent a message, whether a website is really operated by the organisation it names, or what a person intended. No result here means an item is completely safe. When money, passwords, threats, or personal safety are involved, check with a trusted adult and use an official source you find yourself.";
