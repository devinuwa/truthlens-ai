import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseConfig } from "@/lib/env";
import { safeNext } from "@/lib/security/safe-redirect";

const REFRESH_WITHIN_MS = 60_000;

function sessionClock(request: NextRequest): "absent" | "fresh" | "due" {
  const names = request.cookies.getAll().map((cookie) => cookie.name);
  const chunk = names.find((name) => /-auth-token\.0$/.test(name));
  const key = names.find((name) => name.endsWith("-auth-token")) ?? chunk?.replace(/\.0$/, "");
  if (!key) return "absent";
  const direct = request.cookies.get(key)?.value;
  const value = direct
    ? direct
    : [0, 1, 2, 3, 4].map((index) => request.cookies.get(`${key}.${index}`)?.value ?? "").join("");
  if (!value) return "due";
  let raw = value;
  if (raw.startsWith("base64-")) {
    try {
      raw = Buffer.from(raw.slice("base64-".length), "base64url").toString("utf8");
    } catch {
      return "due";
    }
  }
  try {
    const session = JSON.parse(raw) as { expires_at?: number };
    if (typeof session.expires_at !== "number") return "due";
    return session.expires_at * 1000 - Date.now() > REFRESH_WITHIN_MS ? "fresh" : "due";
  } catch {
    return "due";
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const needsAccount = path.startsWith("/reports") || path.startsWith("/settings");
  const config = getPublicSupabaseConfig();

  if (!config) {
    return NextResponse.next();
  }

  const clock = sessionClock(request);
  if (needsAccount && clock === "absent") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", safeNext(path));
    return NextResponse.redirect(url);
  }
  if (!needsAccount && clock !== "due") {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (needsAccount && !data.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", safeNext(path));
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
