"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"

type DemoTab = "executive" | "market" | "competitor" | "risk"

export default function LandingDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("executive")

  return (
    <div id="demo" className="max-w-5xl mx-auto mt-20 lg:mt-28">
      <div className="bg-card/95 rounded-3xl p-1.5 shadow-2xl shadow-indigo-500/10 border border-border/40 relative">
        {/* Glow lines */}
        <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
        <div className="absolute top-3 right-3 z-10 rounded-full bg-foreground/5 border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sample report preview
        </div>

        <div className="bg-card rounded-[20px] p-5 sm:p-6 border border-border/50">
          {/* Window chrome */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-border gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">agent-orchestrator.live ●</span>
              <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold animate-pulse-subtle">RUNNING</span>
            </div>

            <div className="flex items-center gap-1.5 bg-muted/80 p-1.5 rounded-xl border border-border w-full sm:w-auto overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["executive", "market", "competitor", "risk"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 capitalize whitespace-nowrap shrink-0 ${
                    activeTab === tab
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  }`}
                >
                  {tab === "executive" ? "Orchestrator" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Agent`}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="pt-6 min-h-[200px]">
            {activeTab === "executive" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">Executive Verdict</p>
                      <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">GO — Confidence: 91%</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 px-3 py-1 text-xs font-semibold">Strong Market Fit</Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  &quot;The proposed AI-Powered Developer Code Review platform addresses a high-friction pain point in mid-to-enterprise engineering teams. Market demand is accelerating 42% YoY with weak incumbent specialization.&quot;
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>4 agents completed · 18.3s total execution</span>
                </div>
              </div>
            )}

            {activeTab === "market" && (
              <div className="space-y-5 animate-fade-in">
                <p className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">Market Size & Growth Projections</p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: "TAM", value: "$28.4B", color: "text-indigo-600 dark:text-indigo-400" },
                    { label: "SAM", value: "$4.1B", color: "text-cyan-600 dark:text-cyan-400" },
                    { label: "SOM", value: "$380M", color: "text-emerald-600 dark:text-emerald-400" },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/80 p-3 sm:p-4 rounded-xl border border-border text-center space-y-1 min-w-0">
                      <span className="text-xs text-muted-foreground block font-medium truncate">{item.label}</span>
                      <span className={`${item.color} font-extrabold text-lg sm:text-xl block`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">CAGR 42% YoY · Developer tooling vertical · 2024–2028</p>
              </div>
            )}

            {activeTab === "competitor" && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">Competitive Landscape & Moat</p>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 bg-muted/60 p-3.5 rounded-xl border border-border text-sm">
                    <span className="font-semibold text-foreground">Direct Incumbents</span>
                    <span className="text-muted-foreground text-xs">SonarQube, Snyk, CodeClimate</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-sm">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Your Unfair Moat</span>
                    <span className="text-emerald-600 dark:text-emerald-300 text-xs font-medium">Auto PR-Fix + SOC2 Compliance Agent</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "risk" && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-xs uppercase tracking-widest text-red-500 dark:text-red-400 font-bold">Risk Matrix & Mitigations</p>
                <div className="space-y-2">
                  <div className="p-3.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-700 dark:text-red-300 text-sm">
                    <strong>Technical Risk:</strong> High LLM token cost per PR scan.
                  </div>
                  <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm">
                    <strong>Mitigation:</strong> AST diff caching layer before full LLM inference. Estimated 60% cost reduction.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}