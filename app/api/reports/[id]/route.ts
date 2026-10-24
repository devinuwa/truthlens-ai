import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/current-user";
import { deleteOwnedReport, getOwnedReport } from "@/lib/reports/repository";
import { createUserClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Sign in to open a report." }, { status: 401 });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ error: "Accounts are not configured yet." }, { status: 503 });
  const { id } = await context.params;
  try {
    const report = await getOwnedReport(supabase, user.id, id);
    if (!report) return NextResponse.json({ error: "That report was not found." }, { status: 404 });
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "The report could not be opened." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Sign in to delete a report." }, { status: 401 });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ error: "Accounts are not configured yet." }, { status: 503 });
  const { id } = await context.params;
  try {
    await deleteOwnedReport(supabase, user.id, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The report could not be deleted." }, { status: 500 });
  }
}
