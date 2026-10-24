import { OpportunityBrowser } from "@/components/opportunities/browser";
import { getOptionalUser } from "@/lib/auth/current-user";
import { SAMPLE_OPPORTUNITIES } from "@/lib/opportunities/sample-data";
import { loadOpportunities } from "@/lib/opportunities/repository";
import { createUserClient } from "@/lib/supabase/server";

export const instant = false;
export const metadata = { title: "Scholarships and opportunities" };

export default async function OpportunitiesPage() {
  const user = await getOptionalUser();
  const loaded = await loadOpportunities();
  let saved: string[] = [];
  if (user) {
    const supabase = await createUserClient();
    if (supabase) {
      const { data } = await supabase.from("saved_opportunities").select("opportunities(slug)").eq("user_id", user.id);
      saved = (data ?? [])
        .map((row) => {
          const joined = row.opportunities as { slug?: string } | { slug?: string }[] | null;
          if (Array.isArray(joined)) return joined[0]?.slug;
          return joined?.slug;
        })
        .filter((slug): slug is string => Boolean(slug));
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Scholarships and opportunities</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Read the provider, the deadline, the source, and the verification label before you treat any card as something you can apply for.
      </p>
      <div className="mt-5">
        <OpportunityBrowser
          initial={loaded.opportunities}
          demonstration={SAMPLE_OPPORTUNITIES}
          source={loaded.source}
          warning={loaded.warning}
          saved={saved}
          signedIn={Boolean(user)}
        />
      </div>
    </div>
  );
}
