import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeleteReportButton } from "@/components/reports/delete-report-button";
import { Badge } from "@/components/ui/badge";
import { getOptionalUser } from "@/lib/auth/current-user";
import { getOwnedReport, type StoredReport } from "@/lib/reports/repository";
import { createUserClient } from "@/lib/supabase/server";

export const instant = false;

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalUser();
  if (!user) redirect("/login?next=/reports");
  const supabase = await createUserClient();
  if (!supabase) redirect("/login?error=not-configured");
  const { id } = await params;
  let report: StoredReport | null = null;
  try {
    report = await getOwnedReport(supabase, user.id, id);
  } catch {
    report = null;
  }
  if (!report) notFound();
  const indicators = Array.isArray(report.indicators) ? report.indicators : [];

  return (
    <article className="space-y-4">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
        <p className="text-sm text-muted">{new Date(report.createdAt).toLocaleString()}</p>
        <h1 className="mt-1 text-3xl font-bold">{report.label}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="sky">{report.kind}</Badge>
          <Badge>{report.assessmentLabel}</Badge>
          {report.confidenceLevel ? <Badge tone="sun">Indicator strength: {report.confidenceLevel}</Badge> : null}
        </div>
      </header>
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
        <h2 className="font-bold">Indicators</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {indicators.map((item, index) => {
            const indicator = item as { title?: string; explanation?: string; evidence?: string };
            return (
              <li key={`${indicator.title}-${index}`} className="rounded-2xl bg-canvas p-3">
                <p className="font-semibold">{indicator.title}</p>
                <p className="mt-1">{indicator.explanation}</p>
                {indicator.evidence ? <p className="mt-1 text-muted">From the text: {indicator.evidence}</p> : null}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="rounded-3xl bg-sky/15 p-6 text-sm">
        <h2 className="font-bold">Recommended actions</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {report.recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      {report.storeSource && report.sourceExcerpt ? (
        <section className="rounded-3xl bg-sun/50 p-6 text-sm">
          <h2 className="font-bold">Stored excerpt</h2>
          <p className="mt-2">You chose to store this short excerpt. Delete the report to remove it.</p>
          <p className="mt-2 whitespace-pre-wrap">{report.sourceExcerpt}</p>
        </section>
      ) : (
        <p className="text-sm text-muted">The original message was not stored with this report.</p>
      )}
      <p className="text-sm text-muted">{report.limitations}</p>
      <div className="flex flex-wrap gap-3">
        <Link href={report.kind === "url" ? "/check-link" : "/check-message"} className="inline-flex min-h-11 items-center font-semibold text-primary">
          Check another
        </Link>
        <DeleteReportButton id={report.id} />
      </div>
    </article>
  );
}
