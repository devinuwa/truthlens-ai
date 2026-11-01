import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NEXT_COOKIE, nextPathFrom } from "@/lib/auth/callback-url";
import { createUserClient } from "@/lib/supabase/server";

const OTP_TYPES = new Set<EmailOtpType>(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);

export async function GET(request: NextRequest) {
  const next = nextPathFrom(request.nextUrl.searchParams.get("next"), request.cookies.get(NEXT_COOKIE)?.value);
  const url = new URL(request.url);
  if (url.searchParams.get("error") === "access_denied") {
    return finish(url, "/login?error=gmail-cancelled");
  }

  const supabase = await createUserClient();
  if (!supabase) {
    return finish(url, "/login?error=not-configured");
  }

  const described = url.searchParams.get("error_description") || url.searchParams.get("error");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (tokenHash && type && OTP_TYPES.has(type as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (error) return finish(url, `/login?error=${linkError(error.message)}`);
    return finish(url, next);
  }

  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return finish(url, `/login?error=${linkError(error.message)}`);
    return finish(url, next);
  }

  return finish(url, `/login?error=${described ? linkError(described) : "link-invalid"}`);
}

function linkError(raw: string) {
  const message = raw.toLowerCase();
  if (message.includes("expired")) return "link-expired";
  return "link-invalid";
}

function finish(url: URL, path: string) {
  const response = NextResponse.redirect(new URL(path, url.origin));
  response.cookies.set(NEXT_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
