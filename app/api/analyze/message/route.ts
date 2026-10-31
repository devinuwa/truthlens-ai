import { NextResponse } from "next/server";

export const maxDuration = 60;
import { analyzeMessage } from "@/lib/analysis/message";
import { explainAnalysis } from "@/lib/analysis/providers/explain";
import { clientKeyFromHeaders, takeRateLimit } from "@/lib/security/rate-limit";
import { issueMessages, messageRequestSchema } from "@/lib/validation/schemas";

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
    if (raw.length > 20_000) {
      return NextResponse.json({ error: "That request is too large." }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Send the message as JSON." }, { status: 400 });
  }

  const parsed = messageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: issueMessages(parsed.error)[0] ?? "Check the message and try again." }, { status: 400 });
  }

  try {
    const checked = analyzeMessage(parsed.data.text, parsed.data.category, undefined, parsed.data.context);
    const result = await explainAnalysis(parsed.data.text, checked);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "The check could not be completed." }, { status: 500 });
  }
}
