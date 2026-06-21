/**
 * Hybrid sliding-window rate limiter.
 *
 * ▸ If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, uses
 *   @upstash/ratelimit (Redis-backed, safe for multi-region Vercel deployments).
 *
 * ▸ Otherwise falls back to an in-memory Map, which is suitable for local dev
 *   or single-instance Node.js deployments.
 *
 * The public API (rateLimit / getClientIp) is identical in both modes so all
 * callers continue to work without changes.
 */

// ─── In-Memory Fallback ────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leaks.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memStore.entries()) {
      if (entry.resetAt < now) memStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

function memRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSecs * 1000;
  const entry = memStore.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    memStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, resetAt };
  }
  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// ─── Upstash Redis Backend ────────────────────────────────────────────────────

let _upstashRatelimit: any = null;
let _upstashInitialized = false;

/**
 * Lazily initialize the Upstash ratelimit client.
 * Returns null if env vars are not set (falls back to in-memory).
 */
async function getUpstashLimiter(
  config: RateLimitConfig
): Promise<{ limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }> } | null> {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  if (!_upstashInitialized) {
    try {
      const { Redis } = await import("@upstash/redis");
      const { Ratelimit } = await import("@upstash/ratelimit");

      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      _upstashRatelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          config.limit,
          `${config.windowSecs} s`
        ),
        analytics: true,
        prefix: "kts_rl",
      });

      _upstashInitialized = true;
    } catch (err) {
      console.warn("[RateLimit] Upstash init failed, falling back to in-memory:", err);
      return null;
    }
  }

  return _upstashRatelimit;
}

// ─── Public Interface ──────────────────────────────────────────────────────────

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
 * Uses Upstash Redis if configured, in-memory otherwise.
 *
 * NOTE: Returns a Promise — callers must `await` the result.
 * All Next.js API route handlers are already async, so this is safe.
 *
 * @param key      Unique identifier (e.g. IP address + route)
 * @param config   Limit configuration
 */
export async function rateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  return rateLimitAsync(key, config);
}

/**
 * Async version of rateLimit that uses Upstash Redis when available.
 * Preferred for serverless API routes where distributed accuracy matters.
 */
export async function rateLimitAsync(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const limiter = await getUpstashLimiter(config);

  if (limiter) {
    try {
      const result = await limiter.limit(key);
      return {
        success: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } catch (err) {
      console.warn("[RateLimit] Upstash check failed, falling back to in-memory:", err);
    }
  }

  return memRateLimit(key, config);
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
