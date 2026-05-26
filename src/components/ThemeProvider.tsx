"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: "light", setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    const resolved = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    setThemeState(resolved)
    document.documentElement.classList.toggle("dark", resolved === "dark")
  }, [])

  function setTheme(next: Theme) {
    setThemeState(next)
    localStorage.setItem("theme", next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
