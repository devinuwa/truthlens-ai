import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth/current-user";
import { getPublicSupabaseConfig } from "@/lib/env";
import { listOwnedReports } from "@/lib/reports/repository";
import { createUserClient } from "@/lib/supabase/server";

export const instant = false;
export const metadata = { title: "My reports" };

export default async function ReportsPage() {
  if (!getPublicSupabaseConfig()) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
        <h1 className="text-3xl font-bold">My reports</h1>
        <p className="mt-3 text-sm">
          Reports are stored only for signed-in accounts. Add your Supabase URL and anon key, apply the migration, then sign in. Guest checks still work from Check a Message.
        </p>
      </section>
    );
  }
  const user = await getOptionalUser();
  if (!user) redirect("/login?next=/reports");
  const supabase = await createUserClient();
  if (!supabase) redirect("/login?error=not-configured");
  let reports: Awaited<ReturnType<typeof listOwnedReports>> = [];
  let failed = false;
  try {
    reports = await listOwnedReports(supabase, user.id);
  } catch {
    failed = true;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">My reports</h1>
      <p className="mt-2 text-sm text-muted">Only you can see these. Deleting a report removes it from your account.</p>
      {failed ? <p className="mt-4 text-sm font-semibold text-danger">Reports could not be loaded.</p> : null}
      {!failed && reports.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-white p-6 text-sm text-muted">
          No reports yet. Check a message or a link, then choose Save report. By default the original text is not stored.
        </p>
      ) : null}
      <ul className="mt-5 space-y-3">
        {reports.map((report) => (
          <li key={report.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <Link href={`/reports/${report.id}`} className="text-lg font-bold text-primary">
              {report.label}
            </Link>
            <p className="text-sm">{report.assessmentLabel}</p>
            <p className="text-sm text-muted">{new Date(report.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
