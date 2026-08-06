"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])
  if (!mounted) return (
    <div className="h-9 w-9 rounded-full bg-muted/50 animate-pulse" />
  )

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9 rounded-full border border-border/50 bg-muted/40 hover:bg-muted hover:border-indigo-500/40 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <Sun
        className={`
          h-4 w-4 text-amber-500 
          transition-all duration-500 motion-reduce:transition-none
          ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}
        `}
      />
      <Moon
        className={`
          absolute h-4 w-4 text-indigo-400 
          transition-all duration-500 motion-reduce:transition-none
          ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}
        `}
      />
    </Button>
  )
}
