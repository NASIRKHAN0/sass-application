"use client"

import { useTheme } from "next-themes"
import { Toaster } from "sonner"

export function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Toaster
      position="bottom-right"
      theme={isDark ? "dark" : "light"}
      toastOptions={{
        style: isDark
          ? { background: "oklch(0.15 0.007 55)", border: "1px solid oklch(0.24 0.009 55)", color: "oklch(0.93 0.007 75)" }
          : { background: "oklch(0.958 0.009 72)", border: "1px solid oklch(0.89 0.013 70)", color: "oklch(0.14 0.008 55)" },
      }}
    />
  )
}
