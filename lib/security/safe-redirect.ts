const BLOCKED_PREFIXES = ["//", "/\\", "\\"];

export function safeNext(next: string | null | undefined, fallback = "/home"): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (BLOCKED_PREFIXES.some((prefix) => next.startsWith(prefix))) return fallback;
  if (next.includes("\\") || next.includes("://")) return fallback;
  return next;
}
