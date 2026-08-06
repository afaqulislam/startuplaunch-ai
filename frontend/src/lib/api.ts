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
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: number
  email: string
  is_active: boolean
  created_at: string
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function clearToken(): void {
  localStorage.removeItem("token")
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

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.detail) detail = String(data.detail)
    } catch {
      // non-JSON error body; keep the fallback message
    }
    throw new ApiError(detail, res.status)
  }

  return res.json()
}
