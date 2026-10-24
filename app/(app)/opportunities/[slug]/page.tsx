import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { loadOpportunity } from "@/lib/opportunities/repository";
import { isExpired, verificationLabel } from "@/lib/opportunities/types";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await loadOpportunity(slug);
  return { title: item?.title ?? "Opportunity" };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connection();
  const item = await loadOpportunity(slug);
  if (!item) notFound();
  const expired = isExpired(item.deadline, new Date().toISOString().slice(0, 10));
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
      <div className="flex flex-wrap gap-2">
        <Badge tone="sky">{item.opportunityType}</Badge>
        <Badge tone={item.isSample ? "sun" : "teal"}>{verificationLabel(item)}</Badge>
        {expired ? <Badge tone="coral">Expired</Badge> : null}
      </div>
      <h1 className="mt-3 text-3xl font-bold">{item.title}</h1>
      <p className="mt-1 text-muted">{item.provider}</p>
      {item.isSample ? (
        <p className="mt-4 rounded-2xl bg-sun/70 p-3 text-sm">
          Demonstration data. This is not a verified current opportunity, even if a date is shown.
        </p>
      ) : null}
      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className="font-semibold">Eligibility</dt>
          <dd>{item.eligibility}</dd>
        </div>
        <div>
          <dt className="font-semibold">Region</dt>
          <dd>{item.region}</dd>
        </div>
        <div>
          <dt className="font-semibold">Deadline</dt>
          <dd>{item.deadline ?? "No deadline listed"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Last verified</dt>
          <dd>{item.lastVerified ?? "Not verified"}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm">{item.summary}</p>
      <div className="mt-5 flex flex-col gap-2 text-sm">
        <a className="font-semibold text-primary" href={item.applicationUrl} target="_blank" rel="noreferrer">
          Application link
        </a>
        <a className="font-semibold text-primary" href={item.sourceUrl} target="_blank" rel="noreferrer">
          Source link
        </a>
        <Link className="font-semibold" href="/opportunities">
          Back to opportunities
        </Link>
      </div>
    </article>
  );
}
