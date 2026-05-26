/**
 * HMAC-based authentication for internal worker endpoints.
 *
 * The Python worker signs every request with:
 *   HMAC-SHA256(WORKER_API_SECRET, "<timestamp>\n<path>")
 *
 * The server verifies the signature AND that the timestamp is within
 * ±5 minutes — preventing both forgery and replay attacks.
 */
import { createHmac, timingSafeEqual } from "node:crypto"

const TOLERANCE_S = 5 * 60 // 5 minutes

export function buildWorkerSignature(secret: string, timestamp: string, path: string): string {
  return createHmac("sha256", secret).update(`${timestamp}\n${path}`).digest("hex")
}

export function verifyWorkerRequest(req: Request): boolean {
  const secret = process.env.WORKER_API_SECRET
  if (!secret) return false

  const timestamp = req.headers.get("x-worker-timestamp")
  const signature = req.headers.get("x-worker-signature")
  if (!timestamp || !signature) return false

  // Reject stale or future-dated requests
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_S) return false

  const url = new URL(req.url)
  const expected = buildWorkerSignature(secret, timestamp, url.pathname)

  // Constant-time comparison prevents timing-oracle attacks
  try {
    const a = Buffer.from(signature.padEnd(expected.length))
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
