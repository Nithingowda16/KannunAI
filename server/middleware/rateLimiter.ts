/**
 * In-memory sliding window rate limiter for API endpoints to prevent abuse & token exhaustion.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const clientStore = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP/Session

export function checkRateLimit(clientId: string): { isAllowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = clientStore.get(clientId) || { timestamps: [] };

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
  clientStore.set(clientId, { timestamps: validTimestamps });

  return {
    isAllowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - validTimestamps.length,
    resetMs: WINDOW_MS
  };
}
