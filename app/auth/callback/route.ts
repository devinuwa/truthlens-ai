import { NextResponse, type NextRequest } from "next/server";
import { NEXT_COOKIE, nextPathFrom } from "@/lib/auth/callback-url";
import { createUserClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const next = nextPathFrom(request.nextUrl.searchParams.get("next"), request.cookies.get(NEXT_COOKIE)?.value);
  const url = new URL(request.url);
  if (url.searchParams.get("error")) {
    return finish(url, "/login?error=gmail-cancelled");
  }
  const code = url.searchParams.get("code");
  if (!code) {
    return finish(url, "/login?error=link-invalid");
  }
  const supabase = await createUserClient();
  if (!supabase) {
    return finish(url, "/login?error=not-configured");
  }
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return finish(url, "/login?error=link-invalid");
  }
  return finish(url, next);
}

function finish(url: URL, path: string) {
  const response = NextResponse.redirect(new URL(path, url.origin));
  response.cookies.set(NEXT_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
