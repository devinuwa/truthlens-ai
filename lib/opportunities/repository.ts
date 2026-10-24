import "server-only";
import { SAMPLE_OPPORTUNITIES } from "@/lib/opportunities/sample-data";
import type { Opportunity } from "@/lib/opportunities/types";
import { createUserClient } from "@/lib/supabase/server";

export type OpportunityLoad = {
  opportunities: Opportunity[];
  source: "demonstration" | "database" | "empty" | "error";
  warning: string | null;
};

type OpportunityRow = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  opportunity_type: Opportunity["opportunityType"];
  region: string;
  eligibility: string;
  summary: string;
  deadline: string | null;
  application_url: string;
  source_url: string;
  last_verified: string | null;
  verification_status: Opportunity["verificationStatus"];
  is_sample: boolean;
};

function fromRow(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    provider: row.provider,
    opportunityType: row.opportunity_type,
    region: row.region,
    eligibility: row.eligibility,
    summary: row.summary,
    deadline: row.deadline,
    applicationUrl: row.application_url,
    sourceUrl: row.source_url,
    lastVerified: row.last_verified,
    verificationStatus: row.verification_status,
    isSample: row.is_sample,
  };
}

export async function loadOpportunities(): Promise<OpportunityLoad> {
  const supabase = await createUserClient();
  if (!supabase) {
    return {
      opportunities: SAMPLE_OPPORTUNITIES,
      source: "demonstration",
      warning:
        "Supabase is not configured, so these cards are the built-in demonstration set. They are fictional and must not be used to apply.",
    };
  }

  const { data, error } = await supabase
    .from("opportunities")
    .select(
      "id, slug, title, provider, opportunity_type, region, eligibility, summary, deadline, application_url, source_url, last_verified, verification_status, is_sample",
    )
    .order("deadline", { ascending: true })
    .limit(200);

  if (error) {
    return {
      opportunities: [],
      source: "error",
      warning: "The opportunity list could not be loaded. Nothing below is a live result.",
    };
  }

  const opportunities = ((data ?? []) as OpportunityRow[]).map(fromRow);
  if (opportunities.length === 0) {
    return {
      opportunities: [],
      source: "empty",
      warning: "The database has no opportunity rows yet. Apply supabase/seed.sql, or show the demonstration set.",
    };
  }

  return { opportunities, source: "database", warning: null };
}

export async function loadOpportunity(slug: string): Promise<Opportunity | null> {
  const loaded = await loadOpportunities();
  if (loaded.source === "error") return null;
  const pool = loaded.opportunities.length > 0 ? loaded.opportunities : SAMPLE_OPPORTUNITIES;
  return pool.find((item) => item.slug === slug || item.id === slug) ?? null;
}
