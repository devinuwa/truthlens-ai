import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/current-user";
import { deleteOwnedReport, getOwnedReport, listOwnedReports } from "@/lib/reports/repository";
import { createUserClient } from "@/lib/supabase/server";
import { issueMessages, reportSaveSchema } from "@/lib/validation/schemas";

const columns =
  "id, kind, label, category, assessment, assessment_label, confidence_level, indicators, recommendations, limitations, store_source, source_excerpt, created_at";

export async function GET() {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Sign in to see your reports." }, { status: 401 });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ error: "Accounts are not configured yet." }, { status: 503 });
  try {
    const reports = await listOwnedReports(supabase, user.id);
    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: "Reports could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Sign in to save a report." }, { status: 401 });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ error: "Accounts are not configured yet." }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the report as JSON." }, { status: 400 });
  }
  const parsed = reportSaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: issueMessages(parsed.error)[0] ?? "That report could not be saved." }, { status: 400 });
  }

  const data = parsed.data;
  const storeSource = data.storeSource === true;
  const sourceExcerpt = storeSource ? (data.sourceText ?? "").trim().slice(0, 280) : null;
  const label = data.label?.trim() || `${data.kind === "url" ? "Link" : "Message"} check`;

  const { data: row, error } = await supabase
    .from("analysis_reports")
    .insert({
      user_id: user.id,
      kind: data.kind,
      label,
      category: data.category,
      assessment: data.assessment,
      assessment_label: data.assessmentLabel,
      confidence_level: data.confidenceLevel,
      indicators: data.indicators,
      recommendations: data.recommendations,
      limitations: data.limitations,
      store_source: storeSource && Boolean(sourceExcerpt),
      source_excerpt: sourceExcerpt || null,
    })
    .select(columns)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "The report could not be saved." }, { status: 500 });
  }
  const saved = await getOwnedReport(supabase, user.id, row.id);
  return NextResponse.json({ report: saved }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Sign in to delete a report." }, { status: 401 });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ error: "Accounts are not configured yet." }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Choose a report to delete." }, { status: 400 });
  try {
    await deleteOwnedReport(supabase, user.id, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The report could not be deleted." }, { status: 500 });
  }
}
