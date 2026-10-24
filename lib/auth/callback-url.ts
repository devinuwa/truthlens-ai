import { safeNext } from "@/lib/security/safe-redirect";

export const NEXT_COOKIE = "tl_next";

/** Exact callback address. A query string is rejected by the Supabase allow list and falls back to the Site URL. */
export function authCallbackUrl(origin: string): string {
  const url = new URL("/auth/callback", origin.endsWith("/") ? origin : `${origin}/`);
  url.search = "";
  url.hash = "";
  return `${url.origin}${url.pathname}`;
}

export function nextPathFrom(query: string | null | undefined, cookie: string | null | undefined): string {
  const fromQuery = safeNext(query, "");
  if (fromQuery) return fromQuery;
  let decoded = cookie ?? "";
  if (decoded) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      decoded = cookie ?? "";
    }
  }
  return safeNext(decoded, "/home");
}
