import Link from "next/link";
import { connection } from "next/server";
import { MessageChecker } from "@/components/analysis/message-checker";
import { UrlChecker } from "@/components/analysis/url-checker";
import { Card } from "@/components/ui/card";
import { getOptionalUser } from "@/lib/auth/current-user";
import { tipForDate } from "@/lib/content/tips";
import { LESSONS } from "@/lib/academy/lessons";
import { loadOpportunities } from "@/lib/opportunities/repository";
import { isExpired } from "@/lib/opportunities/types";
import { listOwnedReports } from "@/lib/reports/repository";
import { createUserClient } from "@/lib/supabase/server";

export const instant = false;
export const metadata = { title: "Home" };

export default async function DashboardPage() {
  await connection();
  const user = await getOptionalUser();
  const today = new Date().toISOString().slice(0, 10);
  const tip = tipForDate(new Date());
  const opportunities = await loadOpportunities();
  const recommended = opportunities.opportunities.filter((item) => !isExpired(item.deadline, today)).slice(0, 2);
  const lesson = LESSONS[0];
  let reports: { id: string; label: string; assessmentLabel: string }[] = [];
  if (user) {
    const supabase = await createUserClient();
    if (supabase) {
      try {
        reports = (await listOwnedReports(supabase, user.id)).slice(0, 3);
      } catch {
        reports = [];
      }
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold">{user ? `Hello, ${user.displayName}` : "Hello"}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Today’s tip: {tip}</p>
      </header>
      <Card>
        <h2 className="text-xl font-bold">Check a message</h2>
        <p className="mt-2 text-sm text-muted">
          Paste a suspicious chat here. Leave out passwords, identity numbers, and anything you would not want processed. The text is not saved unless you later choose to save a report.
        </p>
        <div className="mt-4">
          <MessageChecker signedIn={Boolean(user)} compact />
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Check a link</h2>
        <p className="mt-2 text-sm text-muted">The address is inspected. The website is not opened.</p>
        <div className="mt-4">
          <UrlChecker signedIn={Boolean(user)} />
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-bold">Recent reports</h2>
          {reports.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              {user
                ? "No saved reports yet. After a check, use Save report if you want a private copy of the result."
                : "Sign in to keep a private history. Guest checks stay on this page only."}
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {reports.map((report) => (
                <li key={report.id}>
                  <Link className="font-semibold text-primary" href={`/reports/${report.id}`}>
                    {report.label}
                  </Link>
                  <p className="text-muted">{report.assessmentLabel}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-bold">Opportunities to practise with</h2>
          {recommended.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No open records are loaded. The opportunities page explains how to show the demonstration set.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {recommended.map((item) => (
                <li key={item.slug}>
                  <Link className="font-semibold text-primary" href={`/opportunities/${item.slug}`}>
                    {item.title}
                  </Link>
                  <p className="text-muted">{item.isSample ? "Demonstration data" : item.provider}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="bg-sky/15">
          <h2 className="font-bold">Digital Safety Academy</h2>
          <p className="mt-2 text-sm">{lesson.title}</p>
          <p className="mt-1 text-sm text-muted">{lesson.summary}</p>
          <Link href={`/academy/${lesson.slug}`} className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary">
            Start lesson
          </Link>
        </Card>
      </div>
    </div>
  );
}
