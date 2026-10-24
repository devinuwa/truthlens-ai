type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const LIMIT = 30;

export function clientKeyFromHeaders(headerValue: string | null): string {
  const first = headerValue?.split(",")[0]?.trim();
  if (!first) return "local";
  return first.slice(0, 80);
}

export function takeRateLimit(key: string, now = Date.now()): { ok: boolean; retryAfterSeconds: number } {
  const current = buckets.get(key);
  if (!current || now - current.updatedAt >= WINDOW_MS) {
    buckets.set(key, { tokens: LIMIT - 1, updatedAt: now });
    return { ok: true, retryAfterSeconds: 0 };
  }
  if (current.tokens <= 0) {
    const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - (now - current.updatedAt)) / 1000));
    return { ok: false, retryAfterSeconds };
  }
  current.tokens -= 1;
  return { ok: true, retryAfterSeconds: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}
