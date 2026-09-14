/**
 * In-memory sliding window rate limiter for API endpoints to prevent abuse & token exhaustion.
 * Pluggable architecture allowing future RedisRateLimiter integration.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const clientStore = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP

export function deriveClientIp(reqHeaders?: Record<string, string | string[] | undefined>, socketIp?: string): string {
  if (reqHeaders) {
    const forwarded = reqHeaders['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      const firstIp = forwarded.split(',')[0].trim();
      if (firstIp) return sanitizeIp(firstIp);
    } else if (Array.isArray(forwarded) && forwarded.length > 0) {
      return sanitizeIp(forwarded[0].trim());
    }

    const realIp = reqHeaders['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) {
      return sanitizeIp(realIp.trim());
    }
  }

  return sanitizeIp(socketIp || '127.0.0.1');
}

function sanitizeIp(ip: string): string {
  return ip.replace(/[^a-fA-F0-9\.:]/g, '').substring(0, 45) || '127.0.0.1';
}

export function checkRateLimit(clientIp: string): { isAllowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const safeIp = sanitizeIp(clientIp);
  const record = clientStore.get(safeIp) || { timestamps: [] };

  // Filter out timestamps outside current window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = validTimestamps[0];
    const resetMs = WINDOW_MS - (now - oldest);
    return {
      isAllowed: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs)
    };
  }

  validTimestamps.push(now);
  clientStore.set(safeIp, { timestamps: validTimestamps });

  return {
    isAllowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - validTimestamps.length,
    resetMs: WINDOW_MS
  };
}
