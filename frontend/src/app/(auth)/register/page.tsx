"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiFetch, type User } from "@/lib/api"
import { BrainCircuit, ArrowRight, Lock, Mail, Sparkles } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      await apiFetch<User>("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="ambient-orb top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/20" />
      <div className="ambient-orb bottom-10 left-10 w-[400px] h-[400px] bg-indigo-600/20" />

      <Card className="w-full max-w-md glass-panel border border-indigo-500/20 shadow-2xl relative z-10 rounded-3xl p-2">
        <CardHeader className="space-y-3 text-center pb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2 group mx-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            <span className="font-heading font-extrabold text-xl text-foreground">StartupLaunch <span className="gradient-text">AI</span></span>
          </Link>
          <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">Create Workspace Account</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Join thousands of founders running autonomous AI validations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive" role="alert" aria-live="polite" className="bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400 rounded-xl text-xs">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com…" 
                  required 
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-muted/80 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-indigo-500 rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="•••••••…"
                  required 
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-muted/80 border-border text-foreground focus-visible:ring-indigo-500 rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Confirm Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="•••••••…"
                  required 
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-muted/80 border-border text-foreground focus-visible:ring-indigo-500 rounded-xl h-11"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 mt-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-500/25 rounded-xl border border-indigo-400/30 transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" /> Provisioning Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
