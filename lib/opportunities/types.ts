export type OpportunityType = "scholarship" | "grant" | "competition" | "internship";

export type VerificationStatus = "official_checked" | "not_yet_checked" | "demonstration";

export type Opportunity = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  opportunityType: OpportunityType;
  region: string;
  eligibility: string;
  summary: string;
  deadline: string | null;
  applicationUrl: string;
  sourceUrl: string;
  lastVerified: string | null;
  verificationStatus: VerificationStatus;
  isSample: boolean;
};

export type OpportunityQuery = {
  text?: string;
  type?: OpportunityType | "all";
  region?: string;
  timing?: "all" | "open" | "expired";
  verification?: VerificationStatus | "all";
};

export function isExpired(deadline: string | null, today = new Date().toISOString().slice(0, 10)): boolean {
  if (!deadline) return false;
  return deadline < today;
}

export function verificationLabel(item: Opportunity): string {
  if (item.isSample || item.verificationStatus === "demonstration") return "Demonstration data";
  if (item.verificationStatus === "official_checked") return "Official source checked";
  return "Not yet checked";
}
