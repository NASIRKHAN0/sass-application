import fs from "node:fs/promises"
import path from "node:path"
import { existsSync } from "node:fs"

// ─── Storage abstraction ──────────────────────────────────────────────────────
// Local disk in dev/staging. Swap STORAGE_DRIVER=r2 to use Cloudflare R2.
// All API routes call these functions — never touch the driver directly.

const DRIVER = process.env.STORAGE_DRIVER ?? "local"
const LOCAL_DIR = path.join(process.cwd(), ".uploads")

// ─── Local driver ─────────────────────────────────────────────────────────────

async function ensureDir() {
  if (!existsSync(LOCAL_DIR)) {
    await fs.mkdir(LOCAL_DIR, { recursive: true })
  }
}

const LOCAL_MAX_BYTES = 200 * 1024 * 1024 // 200 MB hard cap — defense-in-depth

async function localUpload(
  key: string,
  buffer: Buffer,
  _contentType: string
): Promise<void> {
  if (buffer.length > LOCAL_MAX_BYTES) {
    throw new Error(`File exceeds the ${LOCAL_MAX_BYTES / (1024 * 1024)} MB storage limit.`)
  }
  await ensureDir()
  const filePath = path.join(LOCAL_DIR, key.replace(/\//g, "_"))
  await fs.writeFile(filePath, buffer)
}

async function localGetSignedUrl(key: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return `${appUrl}/api/files/${encodeURIComponent(key)}`
}

async function localDelete(key: string): Promise<void> {
  const filePath = path.join(LOCAL_DIR, key.replace(/\//g, "_"))
  try {
    await fs.unlink(filePath)
  } catch {
    // File may already be gone — ignore
  }
}

async function localRead(key: string): Promise<Buffer> {
  const filePath = path.join(LOCAL_DIR, key.replace(/\//g, "_"))
  return fs.readFile(filePath)
}

// ─── R2 driver (stub — wire up when Cloudflare R2 is ready) ──────────────────

async function r2Upload(
  _key: string,
  _buffer: Buffer,
  _contentType: string
): Promise<void> {
  throw new Error("R2 driver not configured. Set STORAGE_DRIVER=local for now.")
}

async function r2GetSignedUrl(_key: string): Promise<string> {
  throw new Error("R2 driver not configured.")
}

async function r2Delete(_key: string): Promise<void> {
  throw new Error("R2 driver not configured.")
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function storageUpload(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  if (DRIVER === "r2") return r2Upload(key, buffer, contentType)
  return localUpload(key, buffer, contentType)
}

export async function storageGetSignedUrl(key: string): Promise<string> {
  if (DRIVER === "r2") return r2GetSignedUrl(key)
  return localGetSignedUrl(key)
}

export async function storageDelete(key: string): Promise<void> {
  if (DRIVER === "r2") return r2Delete(key)
  return localDelete(key)
}

export async function storageRead(key: string): Promise<Buffer> {
  if (DRIVER === "r2") throw new Error("R2 read not implemented via signed URL")
  return localRead(key)
}

export function buildStorageKey(userId: string, jobId: string, filename: string): string {
  return `${userId}/${jobId}/${filename}`
}
