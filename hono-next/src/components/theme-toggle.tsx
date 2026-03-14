"use client"

import { useEffect, useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

type Theme = "light" | "dark"

const storageKey = "sunsama-dashboard-theme"
const storageEvent = "sunsama-theme-updated"
let hasHydrated = false
let cachedTheme: Theme = "dark"

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

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", callback)
  window.addEventListener("storage", callback)
  window.addEventListener(storageEvent, callback)

  return () => {
    mediaQuery.removeEventListener("change", callback)
    window.removeEventListener("storage", callback)
    window.removeEventListener(storageEvent, callback)
  }
}

function getSnapshot() {
  if (typeof window === "undefined" || !hasHydrated) {
    return "dark"
  }

  cachedTheme = getPreferredTheme()
  return cachedTheme
}

function getServerSnapshot() {
  return "dark"
}

function applyTheme(nextTheme: Theme) {
  if (typeof window === "undefined") {
    return
  }

  cachedTheme = nextTheme
  window.localStorage.setItem(storageKey, nextTheme)
  document.documentElement.classList.toggle("dark", nextTheme === "dark")
  window.dispatchEvent(new Event(storageEvent))
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    hasHydrated = true
    cachedTheme = getPreferredTheme()
    window.dispatchEvent(new Event(storageEvent))
  }, [])

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
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}
