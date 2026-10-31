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
  provider?: "gemini" | "groq" | "rules";
};

export const RISK_LEVELS = ["high", "medium", "low", "uncertain"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const CASE_CLASSIFICATIONS = [
  "phishing",
  "financial_fraud",
  "impersonation",
  "scholarship_scam",
  "job_recruitment_scam",
  "advance_fee_fraud",
  "suspicious_payment",
  "account_takeover",
  "malicious_link",
  "social_engineering",
  "cyberbullying",
  "apparently_low_risk",
  "insufficient_evidence",
] as const;

export type CaseClassification = (typeof CASE_CLASSIFICATIONS)[number];

export type EvidenceKind = "fact" | "inference" | "missing";

export type EvidenceItem = {
  id: string;
  kind: EvidenceKind;
  title: string;
  detail: string;
  quote?: string;
};

export const FOLLOW_UP_IDS = ["channel", "expected", "knowsSender", "alreadyPaid", "alreadySharedSecret"] as const;
export type FollowUpId = (typeof FOLLOW_UP_IDS)[number];

export type FollowUpQuestion = {
  id: FollowUpId;
  question: string;
};

export type AnalysisContext = {
  channel?: "sms" | "whatsapp" | "email" | "social" | "in_person" | "other" | "unknown";
  expected?: "yes" | "no" | "unsure";
  knowsSender?: "yes" | "no" | "unsure";
  alreadyPaid?: "yes" | "no" | "unsure";
  alreadySharedSecret?: "yes" | "no" | "unsure";
};

export type SafetyBrief = {
  risk: RiskLevel;
  riskLabel: string;
  classification: CaseClassification;
  classificationLabel: string;
  confidence: ConfidenceLevel;
  verdict: string;
  summary: string;
  evidence: EvidenceItem[];
  warningSigns: string[];
  missing: string[];
  contextNote: string;
  actions: string[];
  avoid: string[];
  verification: string[];
  limitations: string;
  followUps: FollowUpQuestion[];
  interpretation: string | null;
  source: "rules" | "rules_and_model";
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
  brief?: SafetyBrief;
};

export const ASSESSMENT_DISCLAIMER =
  "TruthLens AI provides risk assessments based on the information available. It cannot guarantee that a message, person, website or opportunity is legitimate.";

export const CONFIDENCE_MEANING =
  "This level describes how strongly the listed language or link patterns showed up. It is not a probability that something is a confirmed scam, and it is not a promise that an item is safe.";

export const BASE_LIMITATION =
  "TruthLens looks for warning signs. A matching pattern is a warning sign, not proof that fraud or abuse has been confirmed. It cannot see who sent a message, whether a website is really operated by the organisation it names, or what a person intended. No result here means an item is completely safe. When money, passwords, threats, or personal safety are involved, check with a trusted adult and use an official source you find yourself.";
