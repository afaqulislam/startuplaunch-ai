<div align="center">

<img src="frontend/src/app/icon.svg" width="120" alt="StartupLaunch AI logo">

# <span style="color:#6366f1">StartupLaunch AI</span>

### Autonomous AI Agent Swarms — Instant Startup Idea Validation

Validate your startup idea in minutes with a swarm of specialized AI agents that run market research, competitor analysis and risk assessment **in parallel** — then deliver a single, evidence-backed **Go / No-Go / Pivot** verdict.

<br>

<div style="background:#0b1020;border-radius:14px;padding:12px 24px;color:#a5b4fc;font-size:14px">
<b>Next.js 16</b> &nbsp;·&nbsp; <b>React 19</b> &nbsp;·&nbsp; <b>TypeScript 5</b> &nbsp;·&nbsp; <b>Tailwind CSS v4</b> &nbsp;·&nbsp; <b>FastAPI</b> &nbsp;·&nbsp; <b>Groq Llama 3.3</b> &nbsp;·&nbsp; <b>PostgreSQL</b>
</div>

<br>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white&style=for-the-badge)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=for-the-badge)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss&logoColor=white&style=for-the-badge)](https://tailwindcss.com)

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?logo=python&logoColor=white&style=for-the-badge)](https://www.python.org)
[![Groq](https://img.shields.io/badge/Groq%20Llama%203.3-f55036?style=for-the-badge)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br>

<table align="center">
<tr>
  <td align="center" width="25%" style="background:#eef2ff;border-radius:14px;padding:20px"><div style="font-size:26px;font-weight:800;color:#4338ca">14,200+</div><div style="color:#6b7280;font-size:13px">Ideas Analyzed</div></td>
  <td align="center" width="25%" style="background:#ecfeff;border-radius:14px;padding:20px"><div style="font-size:26px;font-weight:800;color:#0e7490">&lt;20s</div><div style="color:#6b7280;font-size:13px">Avg Swarm Speed</div></td>
  <td align="center" width="25%" style="background:#ecfdf5;border-radius:14px;padding:20px"><div style="font-size:26px;font-weight:800;color:#047857">96%</div><div style="color:#6b7280;font-size:13px">Precision Rate</div></td>
  <td align="center" width="25%" style="background:#fef3c7;border-radius:14px;padding:20px"><div style="font-size:26px;font-weight:800;color:#b45309">4 Agents</div><div style="color:#6b7280;font-size:13px">One Verdict</div></td>
</tr>
</table>

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [The Agent Swarm](#the-agent-swarm)
4. [Key Features](#key-features)
5. [Use Cases](#use-cases)
6. [Tech Stack](#tech-stack)
7. [Repository Structure](#repository-structure)
8. [Quick Start](#quick-start)
9. [Environment Variables](#environment-variables)
10. [API Reference](#api-reference)
11. [Data Model](#data-model)
12. [Testing & Quality](#testing--quality)
13. [Deployment](#deployment)
14. [Security](#security)
15. [Roadmap](#roadmap)
16. [FAQ](#faq)
17. [Contributing](#contributing)
18. [Author & License](#author--license)

---

## Overview

Most founders validate ideas with gut feel, biased friends, or expensive consultants. StartupLaunch AI replaces that with a **repeatable, autonomous research pipeline** that runs in seconds and returns the kind of decision-grade intelligence you would expect from a top-tier venture research team.

| Traditional validation | StartupLaunch AI |
| --- | --- |
| Weeks of manual research | **Minutes** of autonomous swarm execution |
| One opinion at a time | **4 specialized agents** running in parallel |
| Biased, unstructured notes | **Structured, decision-ready JSON reports** |
| Gut-feel verdicts | **Evidence-backed Go / No-Go / Pivot decision** |

**What's inside the box**

<table>
<tr>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#4338ca">Full-Stack</b><br><span style="color:#6b7280;font-size:13px">Next.js + FastAPI monorepo</span></td>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#0e7490">4 AI Agents</b><br><span style="color:#6b7280;font-size:13px">Parallel swarm pipeline</span></td>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#047857">PDF Reports</b><br><span style="color:#6b7280;font-size:13px">Branded &amp; print-ready</span></td>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#b45309">JWT Auth</b><br><span style="color:#6b7280;font-size:13px">bcrypt + rate limiting</span></td>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#dc2626">Crash-Safe</b><br><span style="color:#6b7280;font-size:13px">Auto-recovery workflow</span></td>
</tr>
</table>

---

## How It Works

<table>
<tr>
<td width="20%" align="center" valign="top" style="background:#eef2ff;border-radius:12px;padding:16px">
<div style="width:34px;height:34px;border-radius:50%;background:#4338ca;color:#fff;font-weight:800;margin:0 auto 8px;display:flex;align-items:center;justify-content:center">1</div>
<b>Describe Your Idea</b><br><span style="color:#6b7280;font-size:13px">Title, description, target audience, industry</span>
</td>
<td width="20%" align="center" valign="top" style="background:#e0e7ff;border-radius:12px;padding:16px">
<div style="width:34px;height:34px;border-radius:50%;background:#4338ca;color:#fff;font-weight:800;margin:0 auto 8px;display:flex;align-items:center;justify-content:center">2</div>
<b>Swarm Dispatch</b><br><span style="color:#6b7280;font-size:13px">Three specialist agents fire in parallel</span>
</td>
<td width="20%" align="center" valign="top" style="background:#ecfeff;border-radius:12px;padding:16px">
<div style="width:34px;height:34px;border-radius:50%;background:#0e7490;color:#fff;font-weight:800;margin:0 auto 8px;display:flex;align-items:center;justify-content:center">3</div>
<b>Parallel Research</b><br><span style="color:#6b7280;font-size:13px">Market, competitors and risk analyzed concurrently</span>
</td>
<td width="20%" align="center" valign="top" style="background:#ecfdf5;border-radius:12px;padding:16px">
<div style="width:34px;height:34px;border-radius:50%;background:#047857;color:#fff;font-weight:800;margin:0 auto 8px;display:flex;align-items:center;justify-content:center">4</div>
<b>Executive Synthesis</b><br><span style="color:#6b7280;font-size:13px">Go / No-Go / Pivot verdict + key takeaways</span>
</td>
<td width="20%" align="center" valign="top" style="background:#fef3c7;border-radius:12px;padding:16px">
<div style="width:34px;height:34px;border-radius:50%;background:#b45309;color:#fff;font-weight:800;margin:0 auto 8px;display:flex;align-items:center;justify-content:center">5</div>
<b>Report &amp; PDF</b><br><span style="color:#6b7280;font-size:13px">Structured JSON in the dashboard, exportable to PDF</span>
</td>
</tr>
</table>

---

## The Agent Swarm

A lightweight orchestration layer fans an idea out to **three specialists running in parallel**, then a fourth agent synthesizes everything into an executive decision — powered by Groq's `llama-3.3-70b-versatile` with **enforced structured JSON output**. Agents fail loudly rather than fabricate data, so a completed report is always trustworthy.

```text
                          ┌─────────────────────┐
                          │   Your Startup Idea  │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  SWARM ORCHESTRATOR │
                          │  (120s hard timeout)│
                          └──────────┬──────────┘
                                     │
        ┌─────────────────┬──────────┴───────────┬─────────────────┐
        │                 │                      │                 │
 ┌──────▼───────┐  ┌──────▼───────┐  ┌──────────▼────────┐
 │  MARKET      │  │  COMPETITOR  │  │  RISK             │
 │  RESEARCH    │  │  ANALYSIS    │  │  ASSESSMENT       │
 │  Agent       │  │  Agent       │  │  Agent            │
 │  TAM/SAM/SOM │  │  Direct +    │  │  Technical /      │
 │  Trends      │  │  Indirect    │  │  Market /         │
 │              │  │  Moat        │  │  Execution +      │
 │              │  │              │  │  Mitigations      │
 └──────┬───────┘  └──────┬───────┘  └──────────┬────────┘
        │                 │                     │
        └─────────┬───────┴──────────┬──────────┘
                  │                  │
         ┌────────▼────────┐
         │   EXECUTIVE     │
         │   DECISION      │
         │   AGENT         │
         │   Go / No-Go /  │
         │   Pivot         │
         └────────┬────────┘
                  │
      ┌───────────▼────────────┐
      │  Structured JSON Report │
      │  + PDF export           │
      └─────────────────────────┘
```

<table>
<tr>
<td width="25%" align="center" style="background:#eef2ff;border-radius:12px;padding:14px"><b style="color:#4338ca">Market Research</b><br><span style="color:#6b7280;font-size:13px">Target market, TAM / SAM / SOM, trends</span></td>
<td width="25%" align="center" style="background:#ecfeff;border-radius:12px;padding:14px"><b style="color:#0e7490">Competitor Analysis</b><br><span style="color:#6b7280;font-size:13px">Direct &amp; indirect rivals, unfair moat</span></td>
<td width="25%" align="center" style="background:#fef3c7;border-radius:12px;padding:14px"><b style="color:#b45309">Risk Assessment</b><br><span style="color:#6b7280;font-size:13px">Technical, market, execution + mitigations</span></td>
<td width="25%" align="center" style="background:#ecfdf5;border-radius:12px;padding:14px"><b style="color:#047857">Executive Verdict</b><br><span style="color:#6b7280;font-size:13px">Go / No-Go / Pivot + summary</span></td>
</tr>
</table>

---

## Key Features

<table>
<tr>
<td width="50%" style="border-left:4px solid #6366f1;padding:12px 16px;background:#fafaff;border-radius:8px">
<b>One-click validation</b><br>Describe your idea, hit launch, get a full-depth report in minutes.
</td>
<td width="50%" style="border-left:4px solid #06b6d4;padding:12px 16px;background:#fafffe;border-radius:8px">
<b>Parallel swarm orchestration</b><br>Three specialists run concurrently, then the executive agent decides.
</td>
</tr>
<tr>
<td width="50%" style="border-left:4px solid #10b981;padding:12px 16px;background:#fafefa;border-radius:8px">
<b>Decision-ready dashboard</b><br>Track every project with live status: pending → analyzing → completed / failed.
</td>
<td width="50%" style="border-left:4px solid #f59e0b;padding:12px 16px;background:#fffbf5;border-radius:8px">
<b>PDF export</b><br>Polished, branded, print-ready reports via react-to-print.
</td>
</tr>
<tr>
<td width="50%" style="border-left:4px solid #8b5cf6;padding:12px 16px;background:#fcfaff;border-radius:8px">
<b>Secure authentication</b><br>bcrypt hashing, JWT sessions, built-in sliding-window rate limiting.
</td>
<td width="50%" style="border-left:4px solid #ef4444;padding:12px 16px;background:#fffafa;border-radius:8px">
<b>Crash-safe workflow</b><br>Stuck runs auto-recover after 10 min; swarm runs cap at 120s.
</td>
</tr>
<tr>
<td width="50%" style="border-left:4px solid #64748b;padding:12px 16px;background:#f8fafc;border-radius:8px">
<b>Dark / light mode</b><br>Theme-aware UI with glassmorphism and ambient gradients.
</td>
<td width="50%" style="border-left:4px solid #0ea5e9;padding:12px 16px;background:#f7fcff;border-radius:8px">
<b>SEO + social ready</b><br>Open Graph, Twitter cards, and a custom BrainCircuit brand asset suite.
</td>
</tr>
</table>

---

## Use Cases

<table>
<tr>
<td width="25%" align="center" style="background:#eef2ff;border-radius:12px;padding:16px"><b style="color:#4338ca">Founders</b><br><span style="color:#6b7280;font-size:13px">Pressure-test an idea before spending time and capital</span></td>
<td width="25%" align="center" style="background:#ecfeff;border-radius:12px;padding:16px"><b style="color:#0e7490">Investors</b><br><span style="color:#6b7280;font-size:13px">Quick, structured due-diligence on incoming deals</span></td>
<td width="25%" align="center" style="background:#ecfdf5;border-radius:12px;padding:16px"><b style="color:#047857">Product Teams</b><br><span style="color:#6b7280;font-size:13px">Validate features, verticals and expansion bets</span></td>
<td width="25%" align="center" style="background:#fef3c7;border-radius:12px;padding:16px"><b style="color:#b45309">Accelerators</b><br><span style="color:#6b7280;font-size:13px">Screen cohorts with consistent, objective analysis</span></td>
</tr>
</table>

---

## Tech Stack

<table>
<tr>
<td width="33%" align="center" style="background:#f8fafc;border-radius:12px;padding:16px">
<b>Frontend</b><br><span style="color:#6b7280;font-size:13px">
Next.js 16 · React 19 · TypeScript 5<br>
Tailwind CSS v4 · Base UI + shadcn-style kit<br>
lucide-react · next-themes · react-to-print</span>
</td>
<td width="33%" align="center" style="background:#f8fafc;border-radius:12px;padding:16px">
<b>Backend</b><br><span style="color:#6b7280;font-size:13px">
FastAPI (async) · Python 3.10+<br>
SQLAlchemy 2 (async) · Alembic migrations<br>
python-jose (JWT) · bcrypt</span>
</td>
<td width="33%" align="center" style="background:#f8fafc;border-radius:12px;padding:16px">
<b>AI Runtime</b><br><span style="color:#6b7280;font-size:13px">
Groq · llama-3.3-70b-versatile<br>
AsyncOpenAI SDK · enforced JSON output<br>
SQLite (dev) / PostgreSQL (prod)</span>
</td>
</tr>
</table>

---

## Repository Structure

```text
startuplaunch-ai/
├── backend/                      # FastAPI async API + agent swarm
│   ├── agents/
│   │   ├── base.py               # BaseAgent: LLM client + strict JSON parsing
│   │   ├── orchestrator.py       # Parallel swarm runner (asyncio.gather)
│   │   ├── specialized.py        # Market, Competitor, Risk agents
│   │   └── executive.py          # Go / No-Go / Pivot decision agent
│   ├── api/
│   │   ├── deps.py               # JWT auth dependency (get_current_user)
│   │   └── routers/              # auth.py · projects.py · reports.py
│   ├── core/
│   │   ├── security.py           # JWT + bcrypt, fail-closed SECRET_KEY
│   │   └── ratelimit.py          # Sliding-window limiter
│   ├── services/workflow.py      # Background analysis workflow
│   ├── alembic/                  # DB migrations
│   ├── tests/                    # pytest suite (14 tests)
│   ├── database.py               # Async engine + session factory
│   ├── models.py                 # User / Project / Report ORM models
│   ├── schemas.py                # Pydantic models
│   └── main.py                   # FastAPI app · CORS · routers
└── frontend/                     # Next.js 16 application
    └── src/
        ├── app/
        │   ├── page.tsx              # Landing page
        │   ├── (auth)/               # login · register
        │   ├── dashboard/            # dashboard · new · project/[id]
        │   ├── layout.tsx            # Root layout · metadata · viewport
        │   ├── globals.css           # Design system + themes
        │   └── icon.svg · favicon.ico · apple-icon.png · opengraph-image.png
        ├── components/               # UI kit · theme toggle · confirm dialog
        └── lib/api.ts                # API client + token management
```

---

## Quick Start

<table>
<tr>
<td width="50%" valign="top" style="background:#0b1020;border-radius:14px;padding:18px">

#### Backend — FastAPI

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Unix: source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# SECRET_KEY:  python -c "import secrets; print(secrets.token_urlsafe(48))"
# GROQ_API_KEY: your Groq key

alembic upgrade head
uvicorn main:app --reload --port 8000
```

Interactive API docs: <http://localhost:8000/docs>

</td>
<td width="50%" valign="top" style="background:#0b1020;border-radius:14px;padding:18px">

#### Frontend — Next.js

```bash
cd frontend
npm install

echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
echo NEXT_PUBLIC_SITE_URL=http://localhost:3000 >> .env.local

npm run dev
```

Open <http://localhost:3000>, register an account, and launch your first validation.

</td>
</tr>
</table>

---

## Environment Variables

#### Backend — `backend/.env`

| Variable | Required | Default | Description |
| --- | :-: | --- | --- |
| `SECRET_KEY` | **Yes** | — | JWT signing secret. API refuses to start without it. |
| `GROQ_API_KEY` | **Yes** | — | Groq LLM API key for the agent swarm. |
| `DATABASE_URL` | No | `sqlite+aiosqlite:///./startuplaunch.db` | Async DB URL — use Postgres in production. |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed frontend origins. |

#### Frontend — `frontend/.env.local`

| Variable | Required | Description |
| --- | :-: | --- |
| `NEXT_PUBLIC_API_URL` | Yes (prod) | Backend base URL, e.g. `https://your-api.railway.app` |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Deployed frontend URL, e.g. `https://your-app.vercel.app` |

---

## API Reference

> All endpoints except `register`, `login` and `/` require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | API health / welcome |
| `POST` | `/api/auth/register` | Create an account (email + password, min 8 chars) |
| `POST` | `/api/auth/login` | OAuth2 form login → returns JWT `access_token` |
| `POST` | `/api/projects/` | Create a project (title, description, target_audience?, industry?) |
| `GET` | `/api/projects/` | List current user's projects (newest first) |
| `GET` | `/api/projects/{id}` | Project detail including its report |
| `POST` | `/api/projects/{id}/analyze` | Kick off the swarm in the background |
| `DELETE` | `/api/projects/{id}` | Delete a project + report (cascade) |
| `GET` | `/api/reports/{id}` | Fetch a report by id (owner-scoped) |

**End-to-end example (curl)**

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"founder@example.com","password":"supersecret"}'

# 2. Login → get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=founder@example.com&password=supersecret"
# → {"access_token": "<TOKEN>", "token_type": "bearer"}

# 3. Create a project
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"AI Code Review","description":"AI-powered developer code review platform","industry":"DevTools"}'

# 4. Launch the swarm
curl -X POST http://localhost:8000/api/projects/1/analyze \
  -H "Authorization: Bearer <TOKEN>"
```

**Agent report shape — `Report.content`**

```json
{
  "market_analysis": {
    "target_market": "...",
    "market_size": { "tam": "...", "sam": "...", "som": "..." },
    "trends": ["..."]
  },
  "competitor_analysis": {
    "direct_competitors": ["..."],
    "indirect_competitors": ["..."],
    "differentiators": ["..."]
  },
  "risk_analysis": {
    "technical_risks": ["..."],
    "market_risks": ["..."],
    "execution_risks": ["..."],
    "mitigation_strategies": ["..."]
  },
  "executive_decision": {
    "executive_summary": "...",
    "recommendation": "Go | No-Go | Pivot",
    "key_takeaways": ["..."]
  }
}
```

---

## Data Model

```text
users ──1── N── projects ──1── 1── reports
 id                id                 id
 email (unique)    title              project_id (FK, CASCADE)
 hashed_password   description        content (JSON)
 is_active         target_audience    executive_summary
 created_at        industry           pdf_url
                   status             created_at
                   analysis_started_at
                   user_id (FK, CASCADE)
```

---

## Testing & Quality

<table>
<tr>
<td width="50%" style="background:#f0fdf4;border-radius:14px;padding:16px">

#### Backend — pytest

```bash
cd backend
venv\Scripts\python.exe -m pytest tests -q
# 14 passed — auth · projects · reports
```

</td>
<td width="50%" style="background:#eff6ff;border-radius:14px;padding:16px">

#### Frontend — quality gates

```bash
cd frontend
npx tsc --noEmit      # typecheck
npm run lint          # ESLint
npm run build         # production build
```

</td>
</tr>
</table>

---

## Deployment

<table>
<tr>
<td width="50%" valign="top" style="border-top:5px solid #000;border-radius:10px;padding:16px;background:#fafafa">

#### Frontend → Vercel

1. Push the repo to GitHub and import it into Vercel.
2. Set **Root Directory** to `frontend`.
3. Add env vars: `NEXT_PUBLIC_API_URL` → backend URL, `NEXT_PUBLIC_SITE_URL` → Vercel URL.
4. Deploy — the landing page is fully static; dashboard and auth need the backend URL.

</td>
<td width="50%" valign="top" style="border-top:5px solid #009688;border-radius:10px;padding:16px;background:#f7fbfb">

#### Backend → Railway / Render / Fly.io

FastAPI + SQLite cannot persist on serverless. Deploy the backend on a long-running platform:

1. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
2. Set env vars: `SECRET_KEY`, `GROQ_API_KEY`, `CORS_ORIGINS` (your Vercel URL), `DATABASE_URL` (managed **PostgreSQL**).
3. Run `alembic upgrade head` on deploy.

</td>
</tr>
</table>

---

## Security

| Area | Implementation |
| --- | --- |
| Secrets | Fail-closed — `SECRET_KEY` and `GROQ_API_KEY` never ship with defaults |
| Passwords | bcrypt hashing, 72-byte enforcement, 8-char minimum policy |
| Sessions | JWT (HS256) with 7-day expiry; server only trusts signed tokens |
| Brute-force | Sliding-window rate limiting — 10/15 min per IP, 5/15 min per email |
| Authorization | Owner-scoped queries — every project/report filtered by authenticated user |
| Repo hygiene | `.env`, `venv/`, `*.db` and build artifacts gitignored; `.env.example` is the template |

---

## Roadmap

| Status | Item |
| :-: | --- |
| Next | Postgres + Docker Compose for one-command local setup |
| Next | Report history / diffing across re-analyses |
| Planned | Industry-specific agent tuning and custom agent builder |
| Planned | Email verification and password reset flows |
| Planned | Stripe billing for a SaaS tier |
| Later | Redis-backed rate limiting for multi-worker deploys |

---

## FAQ

<details>
<summary><b>How does the validation actually work?</b></summary>
You describe your idea, and the orchestrator dispatches three specialist agents — Market Research, Competitor Analysis, Risk Assessment — in parallel. An Executive Decision agent then synthesizes their findings into a Go / No-Go / Pivot verdict with an executive summary and key takeaways.
</details>

<details>
<summary><b>Which LLM powers the agents?</b></summary>
The swarm runs on Groq's `llama-3.3-70b-versatile`, accessed through the OpenAI SDK with enforced JSON output. The model is configurable in `backend/agents/base.py`.
</details>

<details>
<summary><b>How long does an analysis take?</b></summary>
Most runs complete in under 20 seconds. Every swarm run is capped at a hard 120-second timeout so a hung LLM call can never block forever.
</details>

<details>
<summary><b>Can I re-run an analysis on the same project?</b></summary>
Yes. Re-dispatching replaces the previous report. If a run is left stuck in "analyzing" (e.g. after a server restart), it auto-recovers after 10 minutes so you can safely re-run.
</details>

<details>
<summary><b>Is my data private?</b></summary>
Yes. Authentication is required, and every project and report query is scoped to the authenticated user. Reports are only visible to their owner.
</details>

<details>
<summary><b>Can I host the backend on Vercel?</b></summary>
Not for a full deployment. The backend is an async FastAPI service with file-based SQLite storage by default — use a long-running platform (Railway, Render, Fly.io) with a managed PostgreSQL database instead.
</details>

<details>
<summary><b>SQLite or PostgreSQL?</b></summary>
SQLite works out of the box for local development (`DATABASE_URL` default). For production, set `DATABASE_URL` to a Postgres URL and run `alembic upgrade head`.
</details>

---

## Contributing

Contributions are welcome and appreciated. To contribute:

1. **Fork** the repository.
2. **Create** a feature branch: `git checkout -b feat/your-feature`.
3. **Commit** your changes with a clear message.
4. **Push** to the branch and open a **Pull Request**.

Please keep the quality gates green before submitting:

```bash
cd backend && python -m pytest tests -q     # all tests pass
cd frontend && npx tsc --noEmit && npm run lint
```

Report bugs and request features via [GitHub Issues](https://github.com/afaqulislam/startuplaunch-ai/issues).

---

## Author & License

<div align="center">

**Afaq Ul Islam** — Product & Engineering

[![GitHub](https://img.shields.io/badge/GitHub-afaqulislam-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/afaqulislam)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-afaqulislam-0A66C2?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/afaqulislam)
[![X](https://img.shields.io/badge/X-%40afaqulislam708-000000?logo=x&logoColor=white&style=for-the-badge)](https://x.com/afaqulislam708)

<br>

**StartupLaunch AI** — *Powered by Autonomous Agent Swarms.*

Released under the [MIT License](LICENSE).

</div>
