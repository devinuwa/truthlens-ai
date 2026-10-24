import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/current-user";
import { isAdminEmail } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueMessages, opportunityWriteSchema } from "@/lib/validation/schemas";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "You do not have permission to add opportunities." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the opportunity as JSON." }, { status: 400 });
  }
  const parsed = opportunityWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: issueMessages(parsed.error)[0] ?? "Check the opportunity fields." }, { status: 400 });
  }
  if (parsed.data.isSample && parsed.data.verificationStatus === "official_checked") {
    return NextResponse.json(
      { error: "A demonstration record cannot be marked as an official source that has been checked." },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const slug = slugify(parsed.data.title);
    const { error } = await admin.from("opportunities").insert({
      slug,
      title: parsed.data.title,
      provider: parsed.data.provider,
      opportunity_type: parsed.data.opportunityType,
      region: parsed.data.region,
      eligibility: parsed.data.eligibility,
      summary: parsed.data.summary,
      deadline: parsed.data.deadline,
      application_url: parsed.data.applicationUrl,
      source_url: parsed.data.sourceUrl,
      last_verified: parsed.data.lastVerified,
      verification_status: parsed.data.verificationStatus,
      is_sample: parsed.data.isSample,
    });
    if (error) return NextResponse.json({ error: "The opportunity could not be saved." }, { status: 500 });
    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "The admin database key is not configured." }, { status: 503 });
  }
}
