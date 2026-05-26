"use client"

import { useTheme } from "@/components/ThemeProvider"
import { Toaster } from "sonner"

export function ThemedToaster() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Toaster
      position="bottom-right"
      theme={isDark ? "dark" : "light"}
      toastOptions={{
        style: isDark
          ? { background: "#8A2D3B", border: "1px solid #BE5B50", color: "#FBDB93" }
          : { background: "#FFFFFF", border: "1px solid #EDCF96", color: "#641B2E" },
      }}
    />
  )
}
