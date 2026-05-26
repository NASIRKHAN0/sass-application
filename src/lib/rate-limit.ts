/**
 * In-memory sliding window rate limiter for upload endpoints.
 * Keyed by userId. State is per-process — fine for local dev and single-instance deployments.
 * For multi-instance production, swap the store for Redis with a Lua sliding-window script.
 */

interface WindowEntry {
  timestamps: number[]
}

const store = new Map<string, WindowEntry>()

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 20  // 20 uploads per minute per user

export function checkRateLimit(userId: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const cutoff = now - WINDOW_MS

  let entry = store.get(userId)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(userId, entry)
  }

  // Drop timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0]
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) }
  }

  entry.timestamps.push(now)
  return { allowed: true, retryAfterMs: 0 }
}
