/**
 * Simple in-memory rate limiter for MVP.
 * TODO: replace with Upstash Redis (or similar) for multi-instance production.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

export function checkRateLimit(key: string): {
  ok: boolean;
  remaining: number;
} {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQUESTS - 1 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { ok: false, remaining: 0 };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { ok: true, remaining: MAX_REQUESTS - existing.count };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") || "unknown";
}
