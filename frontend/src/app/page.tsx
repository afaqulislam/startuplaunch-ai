import Link from "next/link"
import { Button } from "@/components/ui/button"
import LandingHeader from "@/components/landing-header"
import LandingDemo from "@/components/landing-demo"
import { 
  Bot, 
  BrainCircuit, 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  ChevronRight
} from "lucide-react"

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-x-clip">
      {/* Ambient Background Orbs */}
      <div className="ambient-orb top-[-150px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/40 dark:bg-indigo-600/30" />
      <div className="ambient-orb top-[500px] right-[-150px] w-[600px] h-[600px] bg-cyan-500/30 dark:bg-cyan-500/20" />
      <div className="ambient-orb top-[1000px] left-[-150px] w-[600px] h-[600px] bg-emerald-500/25 dark:bg-emerald-500/15" />

      <LandingHeader />

      <main className="flex-1 z-10">
        {/* Hero Section */}
        <section className="w-full py-24 lg:py-32 px-4 relative">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold tracking-wider backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 [animation-duration:1500ms] motion-reduce:animate-none" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-indigo-600 dark:text-indigo-300 uppercase">Multi-Agent Swarm v2.0 Live</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight max-w-5xl leading-[1.05] text-foreground">
              Validate ideas with{" "}
              <span className="gradient-text">Autonomous</span>{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">AI Swarms</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl text-lg sm:text-xl text-foreground/70 dark:text-foreground/80 leading-relaxed font-normal">
              Stop building in the dark. Dispatch four specialized AI agents to deliver instant market research, competitor matrices, risk simulations, and executive verdicts — typically in under a minute.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-2xl shadow-indigo-500/40 dark:shadow-indigo-400/25 border-0 transition-all duration-300 hover:scale-105 hover:shadow-indigo-400/40 group">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse-subtle" />
                  Start Free Validation
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-indigo-100 dark:bg-indigo-900/60 border-indigo-300 dark:border-indigo-500/60 text-indigo-700 dark:text-indigo-200 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-indigo-200 dark:hover:bg-indigo-800/60 hover:shadow-lg hover:shadow-indigo-500/15">
                  Explore Live Demo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>TAM / SAM / SOM in seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                <span>Competitor moat analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span>Executive Go / No-Go verdict</span>
              </div>
            </div>
          </div>

          <LandingDemo />
        </section>

        {/* Stats Bar */}
        <section id="metrics" className="py-16 border-y border-border/60 bg-card/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "4", label: "Agents — One Verdict", color: "text-foreground" },
              { value: "120s", label: "Hard Swarm Cap Per Run", color: "text-indigo-600 dark:text-indigo-400" },
              { value: "10min", label: "Stuck-Run Auto-Recovery", color: "text-cyan-600 dark:text-cyan-400" },
              { value: "78", label: "Automated Tests in CI", color: "text-emerald-600 dark:text-emerald-400" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className={`text-4xl lg:text-5xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Agent Architecture Section */}
        <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">The Advisory Board</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground">Four agents. One verdict.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Specialized agents work in parallel, stress-testing your idea from every dimension simultaneously.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: BarChart3,
                title: "Market Research Agent",
                desc: "Evaluates TAM/SAM/SOM market sizes, growth drivers, target personas, and adoption trends.",
                border: "border-indigo-500/20",
                iconBg: "bg-indigo-500/10 border-indigo-500/25",
                iconColor: "text-indigo-600 dark:text-indigo-400",
                output: "Market Size & CAGR",
                outputColor: "text-indigo-700 dark:text-indigo-300",
              },
              {
                icon: TrendingUp,
                title: "Competitor Intel Agent",
                desc: "Maps direct & indirect competitors, pricing models, feature matrix, and uncovers your unique moat.",
                border: "border-cyan-500/20",
                iconBg: "bg-cyan-500/10 border-cyan-500/25",
                iconColor: "text-cyan-600 dark:text-cyan-400",
                output: "Competitive Moat",
                outputColor: "text-cyan-700 dark:text-cyan-300",
              },
              {
                icon: ShieldAlert,
                title: "Risk Evaluation Agent",
                desc: "Diagnoses technical feasibility hurdles, regulatory obstacles, and execution pitfalls with mitigations.",
                border: "border-amber-500/20",
                iconBg: "bg-amber-500/10 border-amber-500/25",
                iconColor: "text-amber-600 dark:text-amber-400",
                output: "Risk Mitigations",
                outputColor: "text-amber-700 dark:text-amber-300",
              },
              {
                icon: Bot,
                title: "Executive Orchestrator",
                desc: "Synthesizes all findings into a scored executive verdict: Go, Pivot, or No-Go — with key takeaways.",
                border: "border-emerald-500/20",
                iconBg: "bg-emerald-500/10 border-emerald-500/25",
                iconColor: "text-emerald-600 dark:text-emerald-400",
                output: "Final Recommendation",
                outputColor: "text-emerald-700 dark:text-emerald-300",
              },
            ].map(({ icon: Icon, title, desc, border, iconBg, iconColor, output, outputColor }) => (
              <div key={title} className={`glass-panel glass-panel-hover glow-card-indigo rounded-2xl p-6 flex flex-col justify-between space-y-5 border ${border}`}>
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} border flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
                <div className={`pt-4 border-t border-border text-xs font-mono font-semibold ${outputColor}`}>
                  OUTPUT: {output}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-20 px-4 max-w-5xl mx-auto mb-16">
          <div className="p-10 sm:p-14 rounded-3xl bg-indigo-600 text-center space-y-6 relative overflow-hidden shadow-xl shadow-indigo-500/30">
            <div className="ambient-orb -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/40 dark:bg-indigo-500/25" />
            <div className="relative z-10 space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Ready to validate?</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
                Your next big idea deserves{" "}
                <span className="text-white underline decoration-indigo-300/50 underline-offset-4">clarity</span>.
              </h2>
            </div>
            <p className="text-white text-base sm:text-lg max-w-xl mx-auto relative z-10">
              Join thousands of founders and investors validating startup ideas with AI precision before investing time and capital.
            </p>
            <div className="pt-4 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-base font-bold bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl shadow-lg shadow-black/20 border-0 transition-all duration-300 hover:scale-105">
                  Launch Your First Validation <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-border/60 bg-card/50 backdrop-blur-md text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <BrainCircuit className="w-3 h-3 text-white" />
            </div>
            <span>© {new Date().getFullYear()} StartupLaunch AI — Powered by Autonomous Agent Swarms.</span>
          </div>
          <div className="flex gap-6">
            <Link href="https://github.com/afaqulislam" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <GithubIcon className="w-4 h-4" /> GitHub
            </Link>
            <Link href="https://www.linkedin.com/in/afaqulislam" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <LinkedinIcon className="w-4 h-4" /> LinkedIn
            </Link>
            <Link href="https://x.com/afaqulislam708" target="_blank" rel="noopener noreferrer" aria-label="Twitter X" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <XIcon className="w-4 h-4" /> X
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}