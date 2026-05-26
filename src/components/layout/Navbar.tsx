"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useAuth, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Menu, X, Zap, Moon, Sun } from "lucide-react"

const NAV_LINKS = [
  { href: "/tools",     label: "Tools" },
  { href: "/pricing",   label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isSignedIn } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-border/80 bg-card transition-colors group-hover:border-foreground/30">
              <Zap className="h-3.5 w-3.5 text-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              FileAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded transition-colors",
                  pathname === link.href
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            {isSignedIn ? (
              <UserButton
                appearance={{ elements: { avatarBox: "h-8 w-8" } }}
              />
            ) : (
              <>
                <SignInButton mode="redirect">
                  <button className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <button className="px-4 py-1.5 text-sm font-medium rounded border border-foreground/80 bg-foreground text-background hover:bg-foreground/90 transition-colors">
                    Get started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2.5 text-sm rounded transition-colors",
                  pathname === link.href
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-border/60 flex flex-col gap-2">
              {isSignedIn ? (
                <div className="px-3 py-2">
                  <UserButton />
                </div>
              ) : (
                <>
                  <SignInButton mode="redirect">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-3 py-2.5 text-sm text-left text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="redirect">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-3 py-2.5 text-sm font-medium text-center rounded border border-foreground/80 bg-foreground text-background"
                    >
                      Get started free
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
