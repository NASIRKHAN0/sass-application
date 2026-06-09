import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/billing(.*)",
  "/history(.*)",
  "/settings(.*)",
  // /api/upload and /api/jobs are intentionally PUBLIC — guests can convert without signing in
  "/api/billing(.*)",
  "/api/usage(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return

  // API routes must return 401 JSON — redirecting an API POST causes Next.js to
  // throw "Failed to find Server Action" which shows as a generic network error.
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to use this feature." }, { status: 401 })
    }
    return
  }

  // Page routes — let Clerk redirect to sign-in normally
  await auth.protect()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
