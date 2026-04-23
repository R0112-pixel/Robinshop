import type { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

function makeLimiter(opts: {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
  message?: string;
}) {
  const buckets = new Map<string, Bucket>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = opts.key
      ? opts.key(req)
      : (req.ip || req.socket.remoteAddress || "unknown");
    const now = Date.now();
    const existing = buckets.get(key);
    if (!existing || existing.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }
    existing.count += 1;
    if (existing.count > opts.max) {
      res.status(429).json({
        error: opts.message ?? "Too many requests, please slow down.",
      });
      return;
    }
    next();
  };
}

// Conservative defaults. Disable in tests/dev if noisy.
export const apiRateLimit = makeLimiter({
  windowMs: 60_000,
  max: 240,
  message: "Too many requests. Please try again shortly.",
});

export const aiRateLimit = makeLimiter({
  windowMs: 60_000,
  max: 12,
  key: (req) =>
    // Per-user when auth resolved by Clerk middleware
    (req as Request & { auth?: () => { userId?: string } }).auth?.()?.userId ||
    req.ip ||
    "anon",
  message: "AI generation rate limit reached. Please wait a minute.",
});
