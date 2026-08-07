"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiFetch, getToken, type Project } from "@/lib/api"
import { ArrowLeft, Sparkles, Zap, CheckCircle2, Rocket } from "lucide-react"

export default function NewProjectPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [industry, setIndustry] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const applyPreset = (t: string, d: string, ta: string, ind: string) => {
    setTitle(t)
    setDescription(d)
    setTargetAudience(ta)
    setIndustry(ind)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      // 1. Create project
      const project = await apiFetch<Project>("/api/projects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          target_audience: targetAudience || null,
          industry: industry || null
        })
      })

      // 2. Trigger async analysis swarm run
      try {
        await apiFetch(`/api/projects/${project.id}/analyze`, { method: "POST" })
      } catch (err) {
        // Dispatch can fail (e.g. the per-user rate limit). The project still
        // exists; its detail page shows the pending state and will surface the
        // error again if the user re-dispatching is also blocked.
        console.error("Analysis dispatch failed:", err)
      }

      router.push(`/dashboard/project/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="ambient-orb top-[-50px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20" />
      <div className="ambient-orb bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/15" />

      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Workspace
        </Link>
        
        {/* Preset Quick Fill Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
            <Zap className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> Quick Templates:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset("DevAI Code Reviewer", "Autonomous AI agent that reviews GitHub Pull Requests for security flaws, performance bugs, and unit test coverage.", "Software Engineering Teams", "Developer Tools")}
              className="text-xs px-3 py-1.5 rounded-xl bg-muted hover:bg-indigo-500/20 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-200 border border-border transition-all"
            >
              DevAI Code Reviewer
            </button>
            <button
              type="button"
              onClick={() => applyPreset("EcoRoute Logistics", "AI dynamic route optimizer for EV delivery fleets that minimizes battery degradation and charging downtime.", "Last-mile Delivery Companies", "Logistics & CleanTech")}
              className="text-xs px-3 py-1.5 rounded-xl bg-muted hover:bg-cyan-500/20 text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-200 border border-border transition-all"
            >
              EcoRoute Logistics
            </button>
            <button
              type="button"
              onClick={() => applyPreset("BioLongevity AI", "Personalized biomarkers dashboard analyzing bloodwork and wearable data to optimize lifespan.", "Health Conscious Adults", "HealthTech")}
              className="text-xs px-3 py-1.5 rounded-xl bg-muted hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-200 border border-border transition-all"
            >
              BioLongevity AI
            </button>
          </div>
        </div>

        <Card className="glass-panel rounded-3xl border border-indigo-500/20 shadow-2xl p-2 sm:p-4">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                </div>
              </div>
              Submit Startup Concept
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm leading-relaxed mt-1">
              Detail your startup vision. Upon submission, our 4-agent swarm will begin instant market sizing, competitor mapping, and risk analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form id="new-project-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400 rounded-xl text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground text-xs font-semibold uppercase tracking-wider">Startup / Project Name <span className="text-indigo-500 dark:text-indigo-400">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Acme Code Reviewer AI…" 
                  required 
                  autoComplete="off"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/80 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-indigo-500 rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground text-xs font-semibold uppercase tracking-wider">Concept Description <span className="text-indigo-500 dark:text-indigo-400">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="What core problem does your product solve? Who is it for, and what makes your approach unique?…" 
                  required 
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted/80 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-indigo-500 rounded-xl resize-none p-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-foreground text-xs font-semibold uppercase tracking-wider">Target Audience</Label>
                  <Input 
                    id="targetAudience" 
                    placeholder="e.g. B2B SaaS Engineering Managers…" 
                    autoComplete="organization"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="bg-muted/80 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-indigo-500 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-foreground text-xs font-semibold uppercase tracking-wider">Industry Sector</Label>
                  <Input 
                    id="industry" 
                    placeholder="e.g. Developer Tools, Artificial Intelligence…" 
                    autoComplete="organization"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-muted/80 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-indigo-500 rounded-xl h-11"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t border-border pt-6 gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Dispatches Market, Competitor, & Risk Agents
            </div>
            <Button 
              type="submit" 
              form="new-project-form"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-500/25 rounded-xl border border-indigo-400/30 transition-all hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" /> Dispatching Swarm...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Dispatch Swarm Analysis
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
