"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

type Theme = "light" | "dark"

const storageKey = "sunsama-dashboard-theme"

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark"
  }

  const savedTheme = window.localStorage.getItem(storageKey)
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme())

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    window.localStorage.setItem(storageKey, theme)
  }, [theme])

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="rounded-full border-white/15 bg-white/10 backdrop-blur hover:bg-white/15 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
      suppressHydrationWarning
      onClick={() =>
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark"
        )
      }
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}
