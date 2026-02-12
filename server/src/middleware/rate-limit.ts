import { Request, Response, NextFunction } from "express";
import { CONFIG } from "../config/index.js";
import { AppError } from "./error-handler.js";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(windowMs: number = CONFIG.RATE_LIMIT_WINDOW_MS, maxRequests: number = CONFIG.RATE_LIMIT_MAX_REQUESTS) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(key, entry);
    } else {
      entry.count++;

      if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        res.set("Retry-After", retryAfter.toString());
        next(
          new AppError(
            `Too many requests. Please try again after ${retryAfter} seconds.`,
            "RATE_LIMIT_EXCEEDED",
            429
          )
        );
        return;
      }
    }

    res.set("X-RateLimit-Limit", maxRequests.toString());
    res.set("X-RateLimit-Remaining", (maxRequests - entry.count).toString());
    res.set("X-RateLimit-Reset", entry.resetTime.toString());

    next();
  };
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetTime) {
      store.delete(key);
    }
  }
}, 3600000);
