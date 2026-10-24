import { NextResponse } from "next/server";
import { askUrlModel } from "@/lib/analysis/model-client";
import { analyzeUrl, UrlRejectedError } from "@/lib/analysis/url";
import { clientKeyFromHeaders, takeRateLimit } from "@/lib/security/rate-limit";
import { issueMessages, urlRequestSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const limit = takeRateLimit(clientKeyFromHeaders(request.headers.get("x-forwarded-for")));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many checks in a short time. Wait a moment and try again." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 8_000) {
      return NextResponse.json({ error: "That request is too large." }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Send the link as JSON." }, { status: 400 });
  }

  const parsed = urlRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: issueMessages(parsed.error)[0] ?? "Check the link and try again." }, { status: 400 });
  }

  try {
    const model = await askUrlModel(parsed.data.url);
    return NextResponse.json(analyzeUrl(parsed.data.url, model));
  } catch (error) {
    if (error instanceof UrlRejectedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "The link could not be checked." }, { status: 500 });
  }
}
