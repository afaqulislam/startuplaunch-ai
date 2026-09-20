export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export interface Project {
  id: number
  title: string
  description: string
  target_audience: string | null
  industry: string | null
  status: string
  created_at: string
  report?: ProjectReport | null
}

export interface ProjectReport {
  id: number
  content: ReportContent
  executive_summary?: string | null
  pdf_url?: string | null
}

export interface MarketAnalysis {
  target_market?: string
  market_size?: {
    tam?: string | number
    sam?: string | number
    som?: string | number
  }
  trends?: string[]
}

export interface CompetitorAnalysis {
  direct_competitors?: string[]
  indirect_competitors?: string[]
  differentiators?: string[]
}

export interface RiskAnalysis {
  technical_risks?: string[]
  market_risks?: string[]
  execution_risks?: string[]
  mitigation_strategies?: string[]
}

export interface ExecutiveDecision {
  recommendation?: string
  executive_summary?: string
  key_takeaways?: string[]
}

export interface ReportContent {
  market_analysis?: MarketAnalysis | null
  competitor_analysis?: CompetitorAnalysis | null
  risk_analysis?: RiskAnalysis | null
  executive_decision?: ExecutiveDecision | null
  executive_summary?: string
  recommendation?: string
  key_takeaways?: string[]
  market_research?: MarketAnalysis | null
  risk_assessment?: RiskAnalysis | null
  specialized_reports?: {
    market_research?: MarketAnalysis | null
    competitor_analysis?: CompetitorAnalysis | null
    risk_assessment?: RiskAnalysis | null
  }
  // Set by the orchestrator when one or more swarm agents failed but the
  // successful sections were still saved.
  _partial?: boolean
  _agent_errors?: Record<string, string>
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: number
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export interface AdminSummary {
  users: number
  projects: number
  projects_by_status: {
    completed: number
    analyzing: number
    failed: number
    pending: number
  }
}

// The JWT is kept in module-scope memory only (never localStorage, so an XSS
// payload can't exfiltrate it). The HttpOnly session cookie set by the backend
// is the source of truth across reloads; when this in-memory token is present
// it is also sent as the Authorization header for API/SSR-friendliness.
let memoryToken: string | null = null

export function getToken(): string | null {
  return memoryToken
}

export function setToken(token: string): void {
  memoryToken = token
}

// Current authenticated user; the role here only controls what UI is shown.
// Authorization is always enforced server-side via require_role().
export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/api/auth/me")
}

// Admin-only platform summary (server returns 403 for non-admin roles).
export async function getAdminSummary(): Promise<AdminSummary> {
  return apiFetch<AdminSummary>("/api/admin/summary")
}

export async function clearToken(): Promise<void> {
  // The token itself is gone from memory immediately; the HttpOnly cookie can
  // only be cleared by the backend, so issue a best-effort logout. Failures are
  // irrelevant here — the cookie expires with the JWT anyway.
  memoryToken = null
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" })
  } catch {
    // network error during logout is fine, session cookie still expires
  }
}

// SQLite returns naive datetimes like "2026-08-07 12:34:56" (no timezone and a
// space instead of a "T"), which browsers parse as Invalid Date. Normalize to
// an ISO string (interpreted as UTC) so every date renders consistently across
// dev (SQLite) and prod (Postgres).
export function parseDate(value: string): Date {
  let iso = value.includes("T") ? value : value.replace(" ", "T")
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso)) iso += "Z"
  const d = new Date(iso)
  return isNaN(d.getTime()) ? new Date(0) : d
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parseDate(value))
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  if (res.status === 401) {
    await clearToken()
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.detail) {
        if (Array.isArray(data.detail)) {
          // FastAPI validation errors: detail is an array of {loc, msg, type}.
          detail = data.detail.map((d: { msg?: string }) => d?.msg ?? String(d)).join(", ")
        } else {
          detail = String(data.detail)
        }
      }
    } catch {
      // non-JSON error body; keep the fallback message
    }
    throw new ApiError(detail, res.status)
  }

  return res.json()
}
