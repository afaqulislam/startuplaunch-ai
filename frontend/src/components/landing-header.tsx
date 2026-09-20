"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrainCircuit, ArrowRight, Menu, X } from "lucide-react"

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-border/60 backdrop-blur-2xl bg-background/70 sticky top-0 z-50 animate-fade-in">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
            StartupLaunch&nbsp;<span className="gradient-text">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-muted-foreground">
          <Link className="hover:text-foreground transition-colors duration-200" href="#features">Agent Swarm</Link>
          <Link className="hover:text-foreground transition-colors duration-200" href="#demo">Live Demo</Link>
          <Link className="hover:text-foreground transition-colors duration-200" href="#metrics">Stats</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="text-sm font-medium text-foreground hover:bg-muted">
              Log in
            </Button>
          </Link>
          <Link href="/register" className="hidden sm:block">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/40 dark:shadow-indigo-400/30 border-0 rounded-xl px-5 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-20 z-40 border-b border-border/60 backdrop-blur-2xl bg-background/95 shadow-xl shadow-black/5 transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-6 py-6 flex flex-col gap-1" aria-label="Mobile navigation">
          <Link
            href="#features"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-colors"
          >
            Agent Swarm
          </Link>
          <Link
            href="#demo"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-colors"
          >
            Live Demo
          </Link>
          <Link
            href="#metrics"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-colors"
          >
            Stats
          </Link>
          <div className="mt-3 pt-4 border-t border-border flex flex-col gap-3">
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="outline" className="w-full h-12 text-sm font-semibold">
                Log in
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)}>
              <Button className="w-full h-12 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 rounded-xl">
                Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}