import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/auth";

// Basic API limiter (e.g. general GET requests) - 100 requests per 10 seconds
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/api",
});

// Strict limiter for payments & auth - 5 requests per minute
export const paymentLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/payment",
});

// Chat limiter - 30 messages per 10 seconds to prevent spam
export const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/chat",
});
