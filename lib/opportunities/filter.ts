import { isExpired, type Opportunity, type OpportunityQuery } from "@/lib/opportunities/types";

export function filterOpportunities(
  items: Opportunity[],
  query: OpportunityQuery,
  today = new Date().toISOString().slice(0, 10),
): Opportunity[] {
  const text = query.text?.trim().toLowerCase() ?? "";
  return items.filter((item) => {
    if (query.type && query.type !== "all" && item.opportunityType !== query.type) return false;
    if (query.region && query.region !== "all" && item.region !== query.region) return false;
    if (query.verification && query.verification !== "all" && item.verificationStatus !== query.verification) {
      return false;
    }
    const expired = isExpired(item.deadline, today);
    if (query.timing === "open" && expired) return false;
    if (query.timing === "expired" && !expired) return false;
    if (!text) return true;
    const haystack = `${item.title} ${item.provider} ${item.summary} ${item.eligibility} ${item.region}`.toLowerCase();
    return haystack.includes(text);
  });
}
