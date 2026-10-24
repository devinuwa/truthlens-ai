import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/current-user";
import { ownedReportScope } from "@/lib/reports/repository";
import { createUserClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ saved: [] });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ saved: [] });
  const scope = ownedReportScope(user.id);
  const { data, error } = await supabase
    .from("saved_opportunities")
    .select("opportunity_id, opportunities(slug)")
    .eq("user_id", scope.filters.user_id);
  if (error) return NextResponse.json({ error: "Saved opportunities could not be loaded." }, { status: 500 });
  const saved = (data ?? [])
    .map((row) => {
      const joined = row.opportunities as { slug?: string } | { slug?: string }[] | null;
      if (Array.isArray(joined)) return joined[0]?.slug;
      return joined?.slug;
    })
    .filter((slug): slug is string => Boolean(slug));
  return NextResponse.json({ saved });
}

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Sign in to save an opportunity to your account." }, { status: 401 });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ error: "Accounts are not configured yet." }, { status: 503 });
  let slug = "";
  try {
    const body = (await request.json()) as { slug?: string };
    slug = body.slug?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Send the opportunity to save." }, { status: 400 });
  }
  if (!slug) return NextResponse.json({ error: "Choose an opportunity." }, { status: 400 });
  const { data: opportunity, error: lookupError } = await supabase
    .from("opportunities")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError || !opportunity) {
    return NextResponse.json({ error: "That opportunity is not in your database." }, { status: 404 });
  }
  const { error } = await supabase.from("saved_opportunities").insert({
    user_id: user.id,
    opportunity_id: opportunity.id,
  });
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "The opportunity could not be saved." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Sign in to change saved opportunities." }, { status: 401 });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ error: "Accounts are not configured yet." }, { status: 503 });
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "Choose an opportunity." }, { status: 400 });
  const { data: opportunity } = await supabase.from("opportunities").select("id").eq("slug", slug).maybeSingle();
  if (!opportunity) return NextResponse.json({ error: "That opportunity was not found." }, { status: 404 });
  const { error } = await supabase
    .from("saved_opportunities")
    .delete()
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunity.id);
  if (error) return NextResponse.json({ error: "The save could not be removed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
