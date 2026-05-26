import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import type { User } from "@prisma/client"

/**
 * Returns the current authenticated DB user.
 * Auto-creates the DB record on first call if the Clerk webhook hasn't fired yet
 * (common in local dev where the app isn't publicly accessible).
 * Throws a 401 Response if not signed in.
 */
export async function getCurrentUser(): Promise<User> {
  const { userId } = await auth()

  if (!userId) {
    throw new Response("Unauthorized", { status: 401 })
  }

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (existing) return existing

  // No DB record yet (webhook hasn't fired) — fetch from Clerk and create it now
  const clerkUser = await currentUser()
  if (!clerkUser) throw new Response("Unauthorized", { status: 401 })

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ""
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null

  return prisma.user.create({
    data: {
      clerkId: userId,
      email,
      name,
      plan: "FREE",
    },
  })
}

/**
 * Returns the current user or null — use this in server components
 * where you want optional auth (show different UI, not hard block).
 */
export async function getCurrentUserOrNull(): Promise<User | null> {
  const { userId } = await auth()
  if (!userId) return null

  return prisma.user.findUnique({ where: { clerkId: userId } })
}

/**
 * Returns just the Clerk userId — lightweight check for middleware-like use.
 * Throws 401 if not signed in.
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Response("Unauthorized", { status: 401 })
  return userId
}
