"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { apiFetch, getToken, clearToken, ApiError, type Project } from "@/lib/api"
import { 
  Plus, 
  Target, 
  Factory, 
  Calendar, 
  Trash2, 
  RotateCcw, 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  Search, 
  LogOut,
  ChevronRight
} from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProjects = useCallback(async () => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const data = await apiFetch<Project[]>("/api/projects/")
      setProjects(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken()
        router.push("/login")
        return
      }
      // Quietly handle connection errors while server restarts
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects()
  }, [fetchProjects])

  // Polling for analyzing status
  useEffect(() => {
    const hasAnalyzing = projects.some(p => p.status === "analyzing")
    if (!hasAnalyzing) return

    const interval = setInterval(() => {
      fetchProjects()
    }, 4000)

    return () => clearInterval(interval)
  }, [projects, fetchProjects])

  const handleAnalyze = async (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const token = getToken()
    if (!token) return

    const previousStatus = projects.find(p => p.id === projectId)?.status ?? "pending"
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: "analyzing" } : p))

    try {
      await apiFetch(`/api/projects/${projectId}/analyze`, { method: "POST" })
      fetchProjects()
    } catch (err) {
      // Revert the optimistic update so the card reflects the real status
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: previousStatus } : p))
      console.error("Failed to start analysis:", err)
    }
  }

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTarget(project)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    const token = getToken()
    if (!token) return

    try {
      await apiFetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" })
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error("Failed to delete project:", err)
    }
  }

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (project.industry && project.industry.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = selectedStatus === "all" || project.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, selectedStatus])

  // Dashboard Stats
  const stats = useMemo(() => {
    const total = projects.length
    const completed = projects.filter(p => p.status === "completed").length
    const analyzing = projects.filter(p => p.status === "analyzing").length
    const pending = projects.filter(p => p.status === "pending").length
    return { total, completed, analyzing, pending }
  }, [projects])

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "completed": 
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">Completed</Badge>
      case "analyzing": 
        return <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs animate-pulse">Analyzing...</Badge>
      case "failed": 
        return <Badge className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs">Failed</Badge>
      default: 
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-clip">
      {/* Background Orbs */}
      <div className="ambient-orb top-[-100px] left-1/4 w-[600px] h-[400px] bg-indigo-600/15" />
      <div className="ambient-orb top-[400px] right-[-100px] w-[500px] h-[500px] bg-cyan-500/15" />

      {/* Navigation Bar */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-border backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <Link className="flex items-center gap-3 group" href="/dashboard">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-foreground">StartupLaunch <span className="gradient-text">AI</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted gap-2 text-xs font-semibold" 
            onClick={() => {
              clearToken()
              router.push("/")
            }}
          >
            <LogOut className="w-4 h-4" /> Log out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
        
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Idea Validation Workspace</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your startup concepts and run multi-agent market simulations.</p>
          </div>
          <Link href="/dashboard/new">
            <Button className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-500/25 border border-indigo-400/30 rounded-xl gap-2 transition-all hover:scale-105">
              <Plus className="w-5 h-5" /> New Startup Idea
            </Button>
          </Link>
        </div>

        {/* Metrics Summary Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Ideas</span>
            <p className="text-3xl font-extrabold text-foreground mt-2">{stats.total}</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completed Validations</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{stats.completed}</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Agent Runs</span>
            <p className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-2">{stats.analyzing}</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending Swarm Run</span>
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{stats.pending}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <Input 
              placeholder="Search ideas or industries…" 
              aria-label="Search startup ideas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/80 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-indigo-500 rounded-xl h-10 text-xs"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["all", "completed", "analyzing", "pending", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                aria-label={`Filter by ${status} status`}
                aria-pressed={selectedStatus === status}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors transition-shadow ${selectedStatus === status ? "bg-indigo-600 text-white shadow" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading your workspace...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-3xl border border-border border-dashed text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No startup ideas found</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {searchQuery || selectedStatus !== "all" 
                ? "No projects match your search or filter settings." 
                : "You haven't submitted any startup ideas for validation yet."}
            </p>
            <Link href="/dashboard/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                Submit New Idea
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="glass-panel glass-panel-hover glow-card-indigo rounded-3xl border border-border cursor-pointer group flex flex-col justify-between overflow-hidden" 
                onClick={() => router.push(`/dashboard/project/${project.id}`)}
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {project.title}
                      </CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <CardDescription className="line-clamp-2 text-muted-foreground text-sm leading-relaxed h-10">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2.5 pt-0 pb-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Target className="w-3.5 h-3.5 mr-2 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      <span className="line-clamp-1">{project.target_audience || "General Market"}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Factory className="w-3.5 h-3.5 mr-2 text-cyan-500 dark:text-cyan-400 shrink-0" />
                      <span className="line-clamp-1">{project.industry || "Software & Tech"}</span>
                    </div>
                  </CardContent>
                </div>

                <div>
                  {/* Action Bar */}
                  <div className="px-6 py-3 border-t border-border flex items-center justify-between gap-2 bg-muted/40">
                    {project.status === "analyzing" ? (
                      <Button size="sm" variant="outline" disabled className="bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/30 text-xs gap-1.5 h-8 rounded-xl">
                        <Loader2 size={13} className="animate-spin" /> Swarm Running...
                      </Button>
                    ) : project.status === "pending" ? (
                      <Button size="sm" onClick={(e) => handleAnalyze(project.id, e)} className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs gap-1.5 h-8 rounded-xl font-semibold">
                        <Sparkles size={13} /> Analyze Idea
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={(e) => handleAnalyze(project.id, e)} className="border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10 text-xs gap-1.5 h-8 rounded-xl font-medium">
                        <RotateCcw size={13} /> Re-analyze
                      </Button>
                    )}

                    <Button size="sm" variant="ghost" onClick={(e) => handleDeleteClick(project, e)} aria-label={`Delete ${project.title}`} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8 p-0 rounded-xl">
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <CardFooter className="py-3 px-6 border-t border-border flex justify-between items-center text-xs text-muted-foreground bg-muted/60">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1.5" />
                      {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(project.created_at))}
                    </div>
                    <span className="text-indigo-500 dark:text-indigo-400 flex items-center font-semibold">
                      View Report <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}

      </main>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Startup Idea?"
        description={`This will permanently remove "${deleteTarget?.title ?? "this project"}" and its validation report. This action cannot be undone.`}
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
