"use client"

import { useEffect, useState, useRef, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  apiFetch,
  getToken,
  clearToken,
  ApiError,
  type Project,
  type MarketAnalysis,
  type CompetitorAnalysis,
  type RiskAnalysis,
} from "@/lib/api"
import { 
  ArrowLeft, 
  Loader2, 
  Bot, 
  BrainCircuit, 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ChevronRight, 
  Trash2, 
  Sparkles, 
  RotateCcw,
  Building2,
  Target,
  Check,
  RefreshCw
} from "lucide-react"

// ── Helper components ────────────────────────────────────────────────────────

function TagList({ items, color = "indigo" }: { items?: string[], color?: string }) {
  if (!items?.length) return <p className="text-muted-foreground text-sm">No data available.</p>
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30",
    red: "bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/30",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30",
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30",
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`text-xs px-3 py-1.5 rounded-xl font-medium shadow-sm ${colors[color] || colors.indigo}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">{label}</p>
}

function MarketTab({ data }: { data?: MarketAnalysis | null }) {
  if (!data) return <p className="text-muted-foreground">No market data available.</p>
  return (
    <div className="space-y-8">
      <div>
        <SectionLabel label="Target Market Profile" />
        <p className="text-foreground leading-relaxed text-base">{data.target_market || "N/A"}</p>
      </div>
      {data.market_size && (
        <div>
          <SectionLabel label="Market Size Metrics (TAM / SAM / SOM)" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[["TAM (Total Addressable)", data.market_size.tam, "border-indigo-500/30 text-indigo-600 dark:text-indigo-300"], 
              ["SAM (Serviceable Addressable)", data.market_size.sam, "border-cyan-500/30 text-cyan-600 dark:text-cyan-300"], 
              ["SOM (Serviceable Obtainable)", data.market_size.som, "border-emerald-500/30 text-emerald-600 dark:text-emerald-300"]].map(([label, val, style]) => (
              <div key={label} className={`glass-panel rounded-2xl p-5 text-center border ${style}`}>
                <p className="text-xs text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">{label}</p>
                <p className="font-extrabold text-xl sm:text-2xl">{val || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.trends && data.trends.length > 0 && (
        <div>
          <SectionLabel label="Industry Growth Trends" />
          <div className="grid sm:grid-cols-2 gap-3">
            {data.trends?.map((t: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-foreground text-sm glass-panel p-3.5 rounded-xl border border-border">
                <ChevronRight className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CompetitorTab({ data }: { data?: CompetitorAnalysis | null }) {
  if (!data) return <p className="text-muted-foreground">No competitor data available.</p>
  return (
    <div className="space-y-8">
      <div>
        <SectionLabel label="Direct Incumbents" />
        <TagList items={data.direct_competitors} color="red" />
      </div>
      <div>
        <SectionLabel label="Indirect Alternatives" />
        <TagList items={data.indirect_competitors} color="amber" />
      </div>
      <div>
        <SectionLabel label="Your Unfair Differentiators & Moat" />
        <TagList items={data.differentiators} color="emerald" />
      </div>
    </div>
  )
}

function RiskTab({ data }: { data?: RiskAnalysis | null }) {
  if (!data) return <p className="text-muted-foreground">No risk data available.</p>
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <SectionLabel label="Technical Feasibility Risks" />
          <TagList items={data.technical_risks} color="red" />
        </div>
        <div>
          <SectionLabel label="Market Adoption Risks" />
          <TagList items={data.market_risks} color="amber" />
        </div>
        <div>
          <SectionLabel label="Execution & Regulatory Risks" />
          <TagList items={data.execution_risks} color="indigo" />
        </div>
      </div>

      {data.mitigation_strategies && data.mitigation_strategies.length > 0 && (
        <div>
          <SectionLabel label="Actionable Mitigation Strategy Roadmap" />
          <div className="space-y-3">
            {data.mitigation_strategies?.map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-foreground text-sm glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })

  const fetchProject = useCallback(async () => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const data = await apiFetch<Project>(`/api/projects/${id}`)
      setProject(data)
      setFetchError("")
    } catch (err) {
      console.error("Failed to fetch project:", err)
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true)
      } else if (err instanceof ApiError && err.status === 401) {
        clearToken()
        router.push("/login")
        return
      } else {
        setFetchError(err instanceof Error ? err.message : "Unable to reach the analysis service.")
      }
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProject()
  }, [fetchProject])

  // Poll while analyzing
  useEffect(() => {
    if (project?.status === "analyzing") {
      const interval = setInterval(() => {
        fetchProject()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [project?.status, fetchProject])

  const handleAnalyze = async () => {
    const token = getToken()
    if (!token) return

    const previousStatus = project?.status ?? "pending"
    setProject(prev => prev ? { ...prev, status: "analyzing" } : prev)

    try {
      await apiFetch(`/api/projects/${id}/analyze`, { method: "POST" })
      fetchProject()
    } catch (err) {
      // Revert the optimistic update so the UI reflects the real status
      setProject(prev => prev ? { ...prev, status: previousStatus } : prev)
      console.error("Failed to start analysis:", err)
    }
  }

  const handleDelete = async () => {
    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    const token = getToken()
    if (!token) return

    try {
      await apiFetch(`/api/projects/${id}`, { method: "DELETE" })
      router.push("/dashboard")
    } catch (err) {
      console.error("Failed to delete project:", err)
      setDeleteOpen(false)
    }
  }

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
        <p className="text-muted-foreground text-sm font-medium">Retrieving validation report...</p>
      </div>
    )
  }

  if (fetchError && !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 dark:text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Couldn&apos;t load this report</h2>
        <p className="text-muted-foreground text-sm">{fetchError}</p>
        <div className="flex gap-3">
          <Button onClick={fetchProject} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Link href="/dashboard"><Button variant="outline">Back to Workspace</Button></Link>
        </div>
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="text-muted-foreground text-sm">This startup idea may have been deleted or doesn&apos;t exist.</p>
        <Link href="/dashboard"><Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Back to Workspace</Button></Link>
      </div>
    )
  }

  const isCompleted = project.status === "completed"
  const isAnalyzing = project.status === "analyzing"
  const isFailed = project.status === "failed"
  const hasReport = !!project.report

  const reportContent = project.report?.content ?? {}
  const legacy = reportContent.specialized_reports

  const marketData = reportContent.market_analysis || legacy?.market_research || reportContent.market_research
  const competitorData = reportContent.competitor_analysis || legacy?.competitor_analysis
  const riskData = reportContent.risk_analysis || legacy?.risk_assessment || reportContent.risk_assessment

  const executiveData = reportContent.executive_decision || reportContent.executive_summary
  const recommendation =
    typeof executiveData === "object" && executiveData
      ? executiveData.recommendation
      : reportContent.recommendation || null
  const executiveSummary =
    (typeof executiveData === "object" && executiveData
      ? executiveData.executive_summary
      : String(executiveData || "")) || project.report?.executive_summary || ""
  const keyTakeaways: string[] =
    (typeof executiveData === "object" && executiveData ? executiveData.key_takeaways : null) ||
    reportContent.key_takeaways ||
    []

  const recColor = recommendation === "Go" ? "text-emerald-600 dark:text-emerald-400" : recommendation === "No-Go" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
  const recBg = recommendation === "Go" ? "border-emerald-500/30 bg-emerald-500/10" : recommendation === "No-Go" ? "border-red-500/30 bg-red-500/10" : "border-amber-500/30 bg-amber-500/10"
  const RecIcon = recommendation === "Go" ? CheckCircle : recommendation === "No-Go" ? XCircle : AlertTriangle

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="ambient-orb top-[-100px] right-10 w-[600px] h-[500px] bg-indigo-600/15" />
      <div className="ambient-orb bottom-10 left-10 w-[500px] h-[500px] bg-cyan-500/15" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">

        {/* Top Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Workspace
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            {!isAnalyzing && (
              project.status === "pending" ? (
                <Button onClick={handleAnalyze} className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl gap-2 font-semibold">
                  <Sparkles className="w-4 h-4" /> Dispatch Swarm
                </Button>
              ) : (
                <Button variant="outline" onClick={handleAnalyze} className="border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10 rounded-xl gap-2 text-xs font-semibold">
                  <RotateCcw className="w-4 h-4" /> Re-analyze Swarm
                </Button>
              )
            )}

            {isCompleted && hasReport && (
              <Button variant="outline" onClick={() => reactToPrintFn()} className="text-foreground border-border hover:bg-muted rounded-xl text-xs">
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            )}

            <Button variant="ghost" onClick={handleDelete} aria-label="Delete project" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl h-9 w-9 p-0">
              <Trash2 className="h-4 w-4" />
            </Button>

            <Badge variant="outline" className={`
              ${isCompleted ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : ""}
              ${isAnalyzing ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 animate-pulse" : ""}
              ${isFailed ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" : ""}
              ${project.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" : ""}
            `}>
              {project.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Project Header Info */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{project.title}</h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl">{project.description}</p>
          
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-muted/80 px-3 py-1.5 rounded-xl border border-border">
              <Target className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Audience: <strong className="text-foreground">{project.target_audience || "General Market"}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/80 px-3 py-1.5 rounded-xl border border-border">
              <Building2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Industry: <strong className="text-foreground">{project.industry || "Technology"}</strong></span>
            </div>
          </div>
        </div>

        {/* Pending State - Not yet validated */}
        {project.status === "pending" && (
          <div className="glass-panel rounded-3xl p-10 sm:p-12 text-center border border-amber-500/30 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Ready for Analysis</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                This idea hasn&apos;t been validated yet. Dispatch the agent swarm to generate the market research, competitor, and risk reports.
              </p>
            </div>
            <Button onClick={handleAnalyze} className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl gap-2 font-semibold">
              <Sparkles className="w-4 h-4" /> Dispatch Swarm Analysis
            </Button>
          </div>
        )}

        {/* Analyzing State - Active Pipeline Visualizer */}
        {isAnalyzing && (
          <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-cyan-500/30 space-y-8 relative overflow-hidden">
            <div className="ambient-orb top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/20" />
            
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-xl shadow-cyan-500/20 animate-pulse">
                <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
                  <BrainCircuit className="w-10 h-10 text-cyan-500 dark:text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-emerald-400">
                Agent Swarm Executing Live Validation...
              </h3>
              <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
                Market Research, Competitor Intel, and Risk Evaluation agents are actively executing parallel analysis queries.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 pt-4">
              <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span>STEP 1</span>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <p className="text-xs font-bold text-foreground">Market Research</p>
                <p className="text-[11px] text-muted-foreground">Sizing TAM / SAM / SOM</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                  <span>STEP 2</span>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <p className="text-xs font-bold text-foreground">Competitor Analysis</p>
                <p className="text-[11px] text-muted-foreground">Mapping Incumbents</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <span>STEP 3</span>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <p className="text-xs font-bold text-foreground">Risk Assessment</p>
                <p className="text-[11px] text-muted-foreground">Scanning Tech Hurdles</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>STEP 4</span>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <p className="text-xs font-bold text-foreground">Executive Verdict</p>
                <p className="text-[11px] text-muted-foreground">Generating Go / No-Go</p>
              </div>
            </div>
          </div>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="glass-panel p-10 rounded-3xl border border-red-500/30 text-center space-y-4">
            <XCircle className="w-14 h-14 text-red-500 dark:text-red-400 mx-auto" />
            <h3 className="text-2xl font-bold text-foreground">Analysis Encountered an Issue</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Something went wrong during the agent workflow execution. Click below to re-dispatch the swarm.
            </p>
            <Button onClick={handleAnalyze} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              Re-try Swarm Analysis
            </Button>
          </div>
        )}

        {/* Completed Report View */}
        {isCompleted && hasReport && (
          <div className="space-y-8 animate-in fade-in duration-500">

            {/* Executive Verdict Banner */}
            {recommendation && (
              <div className={`p-6 rounded-3xl border ${recBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${recommendation === "Go" ? "bg-emerald-500/20" : recommendation === "No-Go" ? "bg-red-500/20" : "bg-amber-500/20"}`}>
                    <RecIcon className={`w-7 h-7 ${recColor}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Autonomous AI Executive Verdict</p>
                    <h3 className={`text-3xl font-extrabold ${recColor}`}>{recommendation}</h3>
                  </div>
                </div>
                <Badge className={`${recColor} border border-current bg-transparent px-4 py-1.5 text-sm`}>
                  {recommendation === "Go" ? "High Strategic Viability" : recommendation === "No-Go" ? "High Risk / Pivot Recommended" : "Conditional Fit"}
                </Badge>
              </div>
            )}

            {/* Executive Summary Card */}
            <Card className="glass-panel rounded-3xl border border-indigo-500/20 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/50 py-5">
                <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300 text-xl">
                  <Bot className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Executive Summary & Strategy Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <p className="text-foreground leading-relaxed text-base">{executiveSummary || "No summary generated."}</p>

                {keyTakeaways.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <SectionLabel label="Key Strategic Takeaways" />
                    <div className="grid sm:grid-cols-2 gap-3">
                      {keyTakeaways.map((t, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-foreground text-sm glass-panel p-3 rounded-xl border border-border">
                          <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specialized Reports Tabs */}
            <Tabs defaultValue="market" className="w-full">
              <TabsList className="[display:grid]! [grid-template-columns:1fr]! sm:[grid-template-columns:repeat(3,1fr)]! [width:100%]! [height:auto]! gap-1.5 glass-panel p-1.5 rounded-2xl border border-border">
                <TabsTrigger value="market" className="data-active:bg-gradient-to-r data-active:from-indigo-600 data-active:to-cyan-600 data-active:text-white! rounded-xl py-3 px-2 text-xs sm:text-sm font-semibold transition-all">
                  <BarChart3 className="w-4 h-4 mr-1.5 shrink-0" /> Market Sizing
                </TabsTrigger>
                <TabsTrigger value="competitor" className="data-active:bg-gradient-to-r data-active:from-indigo-600 data-active:to-cyan-600 data-active:text-white! rounded-xl py-3 px-2 text-xs sm:text-sm font-semibold transition-all">
                  <TrendingUp className="w-4 h-4 mr-1.5 shrink-0" /> Competitor Moat
                </TabsTrigger>
                <TabsTrigger value="risk" className="data-active:bg-gradient-to-r data-active:from-indigo-600 data-active:to-cyan-600 data-active:text-white! rounded-xl py-3 px-2 text-xs sm:text-sm font-semibold transition-all">
                  <ShieldAlert className="w-4 h-4 mr-1.5 shrink-0" /> Risk Assessment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="market" className="mt-6">
                <Card className="glass-panel rounded-3xl border border-border">
                  <CardHeader><CardTitle className="text-foreground">Market Sizing & Dynamics</CardTitle><CardDescription>Delivered by Autonomous Market Agent</CardDescription></CardHeader>
                  <CardContent><MarketTab data={marketData} /></CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitor" className="mt-6">
                <Card className="glass-panel rounded-3xl border border-border">
                  <CardHeader><CardTitle className="text-foreground">Competitive Landscape & Moat</CardTitle><CardDescription>Delivered by Autonomous Competitor Agent</CardDescription></CardHeader>
                  <CardContent><CompetitorTab data={competitorData} /></CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk" className="mt-6">
                <Card className="glass-panel rounded-3xl border border-border">
                  <CardHeader><CardTitle className="text-foreground">Risk Matrix & Mitigations</CardTitle><CardDescription>Delivered by Autonomous Risk Agent</CardDescription></CardHeader>
                  <CardContent><RiskTab data={riskData} /></CardContent>
                </Card>
              </TabsContent>
            </Tabs>

          </div>
        )}

        {/* Print-Only Export Container */}
        <div style={{ display: "none" }}>
          <div ref={contentRef} className="p-10 text-black bg-white min-h-screen font-sans relative">
            {/* Watermark stamp — repeats on every printed page */}
            <div className="print-watermark" aria-hidden="true">
              <div className="print-watermark-inner">
                <span className="print-watermark-name">Afaq Ul Islam</span>
                <span className="print-watermark-role">Founder · StartupLaunch AI</span>
              </div>
            </div>

            <div className="mb-8 border-b pb-6">
              <h1 className="text-4xl font-extrabold mb-2">{project.title}</h1>
              <p className="text-gray-600">{project.description}</p>
              <div className="flex gap-6 mt-3 text-sm text-gray-500">
                <span><strong>Target Audience:</strong> {project.target_audience || "N/A"}</span>
                <span><strong>Industry:</strong> {project.industry || "N/A"}</span>
              </div>
              {recommendation && <p className="mt-3 font-bold text-lg">AI Verdict: <span>{recommendation}</span></p>}
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 border-b pb-1">Executive Summary</h2>
              <p className="text-gray-800 leading-relaxed">{executiveSummary}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 border-b pb-1">Market Research</h2>
              <p><strong>Target Market:</strong> {marketData?.target_market}</p>
              <p className="mt-1"><strong>Market Size:</strong> TAM: {marketData?.market_size?.tam} | SAM: {marketData?.market_size?.sam} | SOM: {marketData?.market_size?.som}</p>
              <p className="mt-1"><strong>Trends:</strong> {marketData?.trends?.join(", ")}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 border-b pb-1">Competitor Analysis</h2>
              <p><strong>Direct:</strong> {competitorData?.direct_competitors?.join(", ")}</p>
              <p><strong>Indirect:</strong> {competitorData?.indirect_competitors?.join(", ")}</p>
              <p><strong>Differentiators:</strong> {competitorData?.differentiators?.join(", ")}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 border-b pb-1">Risk Assessment</h2>
              <p><strong>Technical Risks:</strong> {riskData?.technical_risks?.join(", ")}</p>
              <p><strong>Market Risks:</strong> {riskData?.market_risks?.join(", ")}</p>
              <p><strong>Mitigation:</strong> {riskData?.mitigation_strategies?.join(", ")}</p>
            </div>

            {/* Signature footer */}
            <div className="print-footer" aria-hidden="true">
              <span>StartupLaunch AI</span>
              <span>Generated {new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date())} · Afaq Ul Islam, Founder</span>
            </div>
          </div>
        </div>

      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete This Project?"
        description={`This will permanently remove "${project.title}" and its validation report. This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => {
          setDeleting(true)
          handleConfirmDelete().finally(() => setDeleting(false))
        }}
      />
    </div>
  )
}
