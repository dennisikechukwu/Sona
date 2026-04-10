import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 20 requests per 1 minute
// This protects your Groq keys from being hammered by malicious transcribing bots
export const createRateLimiter = () => {
  // Gracefully fallback to a dummy rate limiter if credentials aren't set
  // This ensures your project won't crash while building or if you haven't setup Upstash yet
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Upstash Redis credentials missing! Rate limiting is bypassed.");
    return {
      limit: async () => ({ success: true, pending: Promise.resolve(), limit: 0, remaining: 0, reset: 0 }),
    };
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(25, "1 m"),
    analytics: true,
    /**
     * Optional prefix for the keys used in redis. This is useful if you want to share a redis
     * instance with other applications and want to avoid key collisions. The default prefix is
     * @upstash/ratelimit
     */
    prefix: "@upstash/ratelimit/sona",
  });
};
