/**
 * In-memory sliding-window rate limiter.
 * Suitable for single-instance deployments (Vercel serverless per-region).
 * For multi-region production, swap the store for an Upstash Redis client.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global store — persists across requests within the same serverless function instance.
const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leaks.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSecs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and record a rate-limit hit for the given key.
 * @param key      Unique identifier (e.g. IP address + route)
 * @param config   Limit configuration
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSecs * 1000;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // First request in this window
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract the best available client IP from Next.js request headers.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
