<div align="center">

<img src="frontend/src/app/icon.svg" width="120" alt="StartupLaunch AI logo">

# <span style="color:#6366f1">StartupLaunch AI</span>

### Autonomous AI Agent Swarms — Instant Startup Idea Validation

Validate your startup idea in minutes with a swarm of specialized AI agents that run market research, competitor analysis and risk assessment **in parallel** — then deliver a single, evidence-backed **Go / No-Go / Pivot** verdict.

<br>

<div style="background:#0b1020;border-radius:14px;padding:12px 24px;color:#a5b4fc;font-size:14px">
<b>Next.js 16</b> &nbsp;·&nbsp; <b>React 19</b> &nbsp;·&nbsp; <b>TypeScript 5</b> &nbsp;·&nbsp; <b>Tailwind CSS v4</b> &nbsp;·&nbsp; <b>FastAPI</b> &nbsp;·&nbsp; <b>Groq · openai/gpt-oss-120b</b> &nbsp;·&nbsp; <b>PostgreSQL / SQLite</b>
</div>

<br>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white&style=for-the-badge)](https://nextjs.org) [![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=for-the-badge)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org) [![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss&logoColor=white&style=for-the-badge)](https://tailwindcss.com)

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge)](https://fastapi.tiangolo.com) [![Python](https://img.shields.io/badge/Python-3.12+-3776ab?logo=python&logoColor=white&style=for-the-badge)](https://www.python.org) [![Groq](https://img.shields.io/badge/Groq%20openai/gpt-oss-120b-f55036?style=for-the-badge)](https://groq.com) [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br>

<table align="center">
<tr>
  <td align="center" width="25%" style="background:#eef2ff;border-radius:14px;padding:20px"><div style="font-size:26px;font-weight:800;color:#4338ca">4 Agents</div><div style="color:#6b7280;font-size:13px">One Evidence-Backed Verdict</div></td>
  <td align="center" width="25%" style="background:#ecfeff;border-radius:14px;padding:20px"><div style="font-size:26px;font-weight:800;color:#0e7490">120s</div><div style="color:#6b7280;font-size:13px">Hard Swarm Cap Per Run</div></td>
  <td align="center" width="25%" style="background:#ecfdf5;border-radius:14px;padding:20px"><div style="font-size:26px;font-weight:800;color:#047857">10 min</div><div style="color:#6b7280;font-size:13px">Stuck-Run Auto-Recovery</div></td>
  <td align="center" width="25%" style="background:#fef3c7;border-radius:14px;padding:20px"><div style="font-size:26px;font-weight:800;color:#b45309">78 Tests</div><div style="color:#6b7280;font-size:13px">Backend + Frontend (CI)</div></td>
</tr>
</table>

</div>

> **Live demo:** [https://startuplaunchai-aui.vercel.app](https://startuplaunchai-aui.vercel.app) · **Repository:** [github.com/afaqulislam/startuplaunch-ai](https://github.com/afaqulislam/startuplaunch-ai)
>
> **Week 4 final submission docs:** [Final Report](docs/WEEK-4-FINAL-REPORT.md) · [Test Checklist](docs/WEEK-4-TEST-CHECKLIST.md) · [Screenshot Guide](docs/WEEK-4-SCREENSHOT-GUIDE.md) · [Deployment Guide](docs/DEPLOYMENT.md)

---

## Table of Contents ![Table of Contents](https://img.shields.io/badge/Table%20of%20Contents-64748b?style=flat-square&logo=list&logoColor=white)

- [What Is StartupLaunch AI?](#what-is-startuplaunch-ai)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Why It Matters](#why-it-matters)
- [How It Works](#how-it-works)
- [The Agent Swarm](#the-agent-swarm)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
    - [Prerequisites](#prerequisites)
    - [Backend — FastAPI](#backend--fastapi)
    - [Frontend — Next.js](#frontend--nextjs)
    - [First Run Walkthrough](#first-run-walkthrough)
- [Environment Variables](#environment-variables)
    - [Backend — `backend/.env`](#backend--backendenv)
    - [Frontend — `frontend/.env.local`](#frontend--frontendenvlocal)
- [API Reference](#api-reference)
    - [Endpoints](#endpoints)
    - [Query Parameters & Rate Limits](#query-parameters--rate-limits)
    - [End-to-End Example](#end-to-end-example-curl)
    - [Report Schema](#report-schema)
- [Data Model](#data-model)
- [CRUD Operations](#crud-operations)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Search & Filtering](#search--filtering)
- [Testing & Quality](#testing--quality)
    - [Backend — pytest (55 tests)](#backend--pytest-55-tests)
    - [Frontend — quality gates](#frontend--quality-gates)
- [CI/CD](#cicd)
- [Performance & Reliability](#performance--reliability)
- [Deployment](#deployment)
    - [Frontend → Vercel](#frontend--vercel)
    - [Backend → Railway / Render / Fly.io](#backend--railway--render--flyio)
    - [Database Migrations](#database-migrations)
- [Security](#security)
- [Limitations](#limitations)
- [Roadmap & Future Improvements](#roadmap--future-improvements)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Author & License](#author--license)

---

## What Is StartupLaunch AI? ![What Is StartupLaunch AI](https://img.shields.io/badge/What%20Is%20StartupLaunch%20AI-6366f1?style=flat-square&logo=rocket&logoColor=white)

Most founders validate ideas with gut feel, biased friends, or expensive consultants. StartupLaunch AI replaces that with a **repeatable, autonomous research pipeline** that runs in seconds and returns the kind of decision-grade intelligence you would expect from a top-tier venture research team.

It is a full-stack web application (Next.js + FastAPI monorepo) that:

- Accepts a startup idea (title, description, target audience, industry).
- Dispatches **three specialized AI agents in parallel** — Market Research, Competitor Analysis, Risk Assessment — powered by Groq's `openai/gpt-oss-120b`.
- Synthesizes their findings with a fourth **Executive Decision agent** into a **Go / No-Go / Pivot** recommendation.
- Persists everything as a structured, tabbed report with **PDF export**, all behind secure authentication.

| Traditional validation     | StartupLaunch AI                                |
| -------------------------- | ----------------------------------------------- |
| Weeks of manual research   | **Minutes** of autonomous swarm execution       |
| One opinion at a time      | **4 specialized agents** running in parallel    |
| Biased, unstructured notes | **Structured, decision-ready JSON reports**     |
| Gut-feel verdicts          | **Evidence-backed Go / No-Go / Pivot decision** |

**What's inside the box**

<table>
<tr>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#4338ca">Full-Stack</b><br><span style="color:#6b7280;font-size:13px">Next.js + FastAPI monorepo</span></td>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#0e7490">4 AI Agents</b><br><span style="color:#6b7280;font-size:13px">Parallel swarm pipeline</span></td>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#047857">PDF Reports</b><br><span style="color:#6b7280;font-size:13px">Server-side, professional &amp; watermarked</span></td>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#b45309">JWT Auth</b><br><span style="color:#6b7280;font-size:13px">bcrypt + rate limiting</span></td>
<td align="center" width="20%" style="background:#f8fafc;border-radius:10px;padding:12px"><b style="color:#dc2626">Crash-Safe</b><br><span style="color:#6b7280;font-size:13px">Auto-recovery workflow</span></td>
</tr>
</table>

---

## Problem Statement ![Problem Statement](https://img.shields.io/badge/Problem-ef4444?style=flat-square&logo=alert&logoColor=white)

Most founders validate startup ideas with gut feel, biased friends, or expensive consultants. A structured research cycle — understanding the addressable market, mapping competitors, and stress-testing risks — takes weeks and can cost thousands in agency fees. As a result:

- **Ideas are validated by opinion, not evidence** — biased friends and anecdotal feedback replace real market research.
- **Research is slow and unscalable** — a single quality validation can take weeks of manual work.
- **Analysis is unstructured** — findings live in scattered docs, notes and PDFs that are hard to compare or trust.
- **Verdicts are gut-feel** — founders rarely get an evidence-backed Go / No-Go / Pivot decision before spending time and capital.

## Solution ![Solution](https://img.shields.io/badge/Solution-10b981?style=flat-square&logo=rocket&logoColor=white)

StartupLaunch AI is a production-style full-stack web application that automates the validation pipeline with a swarm of **four specialized AI agents** that run in parallel and synthesize an evidence-backed executive verdict:

1. A founder submits an idea once (title, description, target audience, industry).
2. **Market Research, Competitor Analysis and Risk Assessment agents** analyze the idea concurrently and return structured JSON.
3. An **Executive Decision agent** synthesizes everything into a **Go / No-Go / Pivot** recommendation with an executive summary and key takeaways.
4. Results persist as a structured, tabbed report behind secure auth, with **server-side PDF export** for sharing.

Everything is authenticated, role-aware, rate-limited, and stored in a real database — a complete production-style backend and frontend rather than a single script.

---

## Why It Matters ![Why It Matters](https://img.shields.io/badge/Why%20It%20Matters-f59e0b?style=flat-square&logo=zap&logoColor=white)

<table>
<tr>
<td width="33%" align="center" style="background:#eef2ff;border-radius:12px;padding:16px"><b style="color:#4338ca">Speed</b><br><span style="color:#6b7280;font-size:13px">Most runs finish in under a minute — a full research cycle, not a slide deck.</span></td>
<td width="33%" align="center" style="background:#ecfeff;border-radius:12px;padding:16px"><b style="color:#0e7490">Consistency</b><br><span style="color:#6b7280;font-size:13px">Every idea gets the same rigorous, structured analysis — no mood swings, no bias.</span></td>
<td width="33%" align="center" style="background:#ecfdf5;border-radius:12px;padding:16px"><b style="color:#047857">Objectivity</b><br><span style="color:#6b7280;font-size:13px">Agents fail loudly rather than fabricate, so a completed report is trustworthy.</span></td>
</tr>
</table>

---

## How It Works ![How It Works](https://img.shields.io/badge/How%20It%20Works-06b6d4?style=flat-square&logo=workflow&logoColor=white)

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

The full request lifecycle:

1. The user creates a project and hits **Analyze**.
2. The backend **atomically claims** the run (single `UPDATE`), setting status to `analyzing` — two concurrent requests can never double-dispatch the swarm.
3. A **background task** runs the orchestrator; the dashboard polls status every 4 seconds while a run is in flight.
4. On success the project moves to `completed`; on failure it moves to `failed` with the run reset so the user can retry.

---

## The Agent Swarm ![The Agent Swarm](https://img.shields.io/badge/The%20Agent%20Swarm-8b5cf6?style=flat-square&logo=network&logoColor=white)

A lightweight orchestration layer fans an idea out to **three specialists running in parallel**, then a fourth agent synthesizes everything into an executive decision — powered by Groq's `openai/gpt-oss-120b` with **enforced structured JSON output**.

Every specialist analyzes from its own knowledge and reasoning; uncertain figures are explicitly labeled as estimates, so the report never presents guessed numbers as fact.

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

**Agent roles**

<table>
<tr>
<td width="25%" align="center" style="background:#eef2ff;border-radius:12px;padding:14px"><b style="color:#4338ca">Market Research</b><br><span style="color:#6b7280;font-size:13px">Target market, TAM / SAM / SOM, trends</span></td>
<td width="25%" align="center" style="background:#ecfeff;border-radius:12px;padding:14px"><b style="color:#0e7490">Competitor Analysis</b><br><span style="color:#6b7280;font-size:13px">Direct &amp; indirect rivals, unfair moat / differentiators</span></td>
<td width="25%" align="center" style="background:#fef3c7;border-radius:12px;padding:14px"><b style="color:#b45309">Risk Assessment</b><br><span style="color:#6b7280;font-size:13px">Technical, market, execution risks + mitigations</span></td>
<td width="25%" align="center" style="background:#ecfdf5;border-radius:12px;padding:14px"><b style="color:#047857">Executive Verdict</b><br><span style="color:#6b7280;font-size:13px">Go / No-Go / Pivot + executive summary</span></td>
</tr>
</table>

**Resilience by design**

- **Honest, not hallucinated.** Each specialist analyzes from its own knowledge and is instructed to label anything uncertain as an estimate (e.g. `~$5B (estimate)`) instead of presenting it as fact.
- **Fail loudly, never fabricate.** Agents reject empty responses and malformed JSON. A report is only marked `completed` if the data is real; if an agent fails, the project is marked `failed` so you know the analysis did not finish.
- **Structured output everywhere.** Enforced JSON mode on Groq, with a strict parser that tolerates markdown fences but rejects anything that is not a JSON object.
- **Bounded spend.** Each swarm run is capped at a hard **120-second timeout**, and per-user dispatch is rate-limited.

---

## Key Features ![Key Features](https://img.shields.io/badge/Key%20Features-10b981?style=flat-square&logo=sparkles&logoColor=white)

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
<b>Decision-ready dashboard</b><br>Live status (pending → analyzing → completed / failed) with 4-second polling and live metrics.
</td>
<td width="50%" style="border-left:4px solid #f59e0b;padding:12px 16px;background:#fffbf5;border-radius:8px">
<b>Server-side search &amp; filter</b><br>Search by title, description or industry with 400ms debounce; filter by status; pagination that composes with both.
</td>
</tr>
<tr>
<td width="50%" style="border-left:4px solid #8b5cf6;padding:12px 16px;background:#fcfaff;border-radius:8px">
<b>PDF export</b><br>Professional, branded, device-independent PDF generated server-side (reportlab) — no browser print dialog.
</td>
<td width="50%" style="border-left:4px solid #ef4444;padding:12px 16px;background:#fffafa;border-radius:8px">
<b>Crash-safe workflow</b><br>Stuck runs auto-recover after 10 minutes; each swarm run caps at 120 seconds.
</td>
</tr>
<tr>
<td width="50%" style="border-left:4px solid #64748b;padding:12px 16px;background:#f8fafc;border-radius:8px">
<b>Secure authentication</b><br>bcrypt hashing, HttpOnly-cookie JWT sessions, and **token revocation** — changing your password kills every outstanding session at once.
</td>
<td width="50%" style="border-left:4px solid #0ea5e9;padding:12px 16px;background:#f7fcff;border-radius:8px">
<b>Hardened by default</b><br>CSP + security headers on both tiers, fail-closed secrets, owner-scoped queries, sliding-window rate limiting.
</td>
</tr>
<tr>
<td width="50%" style="border-left:4px solid #0d9488;padding:12px 16px;background:#f0fdfa;border-radius:8px">
<b>Dark / light mode</b><br>Theme-aware UI with glassmorphism and ambient gradients.
</td>
<td width="50%" style="border-left:4px solid #b45309;padding:12px 16px;background:#fffbeb;border-radius:8px">
<b>SEO + social ready</b><br>Open Graph, Twitter cards, and a custom BrainCircuit brand asset suite.
</td>
</tr>
</table>

---

## Use Cases ![Use Cases](https://img.shields.io/badge/Use%20Cases-f59e0b?style=flat-square&logo=target&logoColor=white)

<table>
<tr>
<td width="25%" align="center" style="background:#eef2ff;border-radius:12px;padding:16px"><b style="color:#4338ca">Founders</b><br><span style="color:#6b7280;font-size:13px">Pressure-test an idea before spending time and capital</span></td>
<td width="25%" align="center" style="background:#ecfeff;border-radius:12px;padding:16px"><b style="color:#0e7490">Investors</b><br><span style="color:#6b7280;font-size:13px">Quick, structured due-diligence on incoming deals</span></td>
<td width="25%" align="center" style="background:#ecfdf5;border-radius:12px;padding:16px"><b style="color:#047857">Product Teams</b><br><span style="color:#6b7280;font-size:13px">Validate features, verticals and expansion bets</span></td>
<td width="25%" align="center" style="background:#fef3c7;border-radius:12px;padding:16px"><b style="color:#b45309">Accelerators</b><br><span style="color:#6b7280;font-size:13px">Screen cohorts with consistent, objective analysis</span></td>
</tr>
</table>

---

## Tech Stack ![Tech Stack](https://img.shields.io/badge/Tech%20Stack-0ea5e9?style=flat-square&logo=layers&logoColor=white)

<table>
<tr>
<td width="33%" align="center" style="background:#f8fafc;border-radius:12px;padding:16px">
<b>Frontend</b><br><span style="color:#6b7280;font-size:13px">
Next.js 16 (App Router) · React 19 · TypeScript 5<br>
Tailwind CSS v4 · Base UI + shadcn-style kit<br>
lucide-react · next-themes</span>
</td>
<td width="33%" align="center" style="background:#f8fafc;border-radius:12px;padding:16px">
<b>Backend</b><br><span style="color:#6b7280;font-size:13px">
FastAPI (async) · Python 3.10+<br>
SQLAlchemy 2 (async) · Alembic migrations<br>
asyncpg · python-jose (JWT) · bcrypt<br>
reportlab (server-side PDF export)</span>
</td>
<td width="33%" align="center" style="background:#f8fafc;border-radius:12px;padding:16px">
<b>AI Runtime</b><br><span style="color:#6b7280;font-size:13px">
Groq · openai/gpt-oss-120b<br>
OpenAI SDK · enforced JSON output (Groq endpoint)<br>
Fast parallel agent swarm<br>
Redis-backed rate limiting (optional)<br>
SQLite (dev) · PostgreSQL / Neon (prod)</span>
</td>
</tr>
</table>

---

## Architecture Overview ![Architecture Overview](https://img.shields.io/badge/Architecture-6366f1?style=flat-square&logo=diagram&logoColor=white)

A three-tier architecture: a statically-rendered Next.js frontend, an async FastAPI API, and a relational database, with the Groq LLM runtime consumed server-side only.

```text
┌──────────────────────┐        ┌─────────────────────────────┐        ┌─────────────────┐
│   Next.js (App Router)│  HTTPS  │       FastAPI (async)        │  SQL   │   Database       │
│   ────────────────── │<───────>│  ──────────────────────────  │<─────> │   ─────────────   │
│  Landing page        │  JWT /  │  Auth (bcrypt + JWT + cookie)│        │  users           │
│  Login / Register    │ HttpOnly│  Projects CRUD + search      │        │  projects        │
│  Dashboard           │  cookie │  Reports + server-side PDF   │        │  reports         │
│  Report viewer       │        │  Admin summary (RBAC)        │        │  (SQLite dev,     │
│  Admin panel (badge) │        │  Rate limiting (Redis/InProc) │        │   Postgres prod)  │
│  PDF download        │        │  Security headers + CORS     │        │                  │
└──────────────────────┘        │  ──────────────────────────  │        └─────────────────┘
                                │  AGENT SWARM (Groq)          │
                                │  Market · Competitor · Risk  │
                                │  → parallel → Executive      │
                                └─────────────────────────────┘
```

**Key architectural decisions**

- **Async first.** FastAPI + async SQLAlchemy / asyncpg / aiosqlite keep the whole request path non-blocking; the swarm itself runs as an asyncio task.
- **Background analysis.** Analysis runs in a FastAPI `BackgroundTasks` workflow — the API responds immediately and the dashboard polls status until the run completes or fails.
- **Server-side generation.** Search/filter/pagination and PDF export all happen on the backend so behavior is consistent and verifiable.
- **Security at the API, not the UI.** JWT + HttpOnly session cookie, CSRF origin checks, owner-scoped queries and `require_role()` enforcement mean the frontend never acts as the only security layer.

---

## Repository Structure ![Repository Structure](https://img.shields.io/badge/Repository%20Structure-94a3b8?style=flat-square&logo=folder&logoColor=white)

```text
startuplaunch-ai/
├── backend/                       # FastAPI async API + agent swarm
│   ├── agents/
│   │   ├── base.py                # BaseAgent: OpenAI-compatible Groq client, strict JSON extraction
│   │   ├── orchestrator.py        # Parallel swarm runner (gather + 120s timeout)
│   │   ├── specialized.py         # Market · Competitor · Risk agents
│   │   └── executive.py           # Go / No-Go / Pivot decision agent
│   ├── api/
│   │   ├── deps.py                # JWT auth dependency (header or HttpOnly cookie) + token-version revocation + role checks
│   │   └── routers/               # auth.py (incl. logout, /me) · admin.py (admin-only summary) · projects.py · reports.py
│   ├── core/
│   │   ├── security.py            # JWT + bcrypt + session-cookie settings, fail-closed SECRET_KEY
│   │   └── ratelimit.py           # Sliding-window limiter (in-memory or Redis)
│   ├── services/workflow.py       # Background analysis workflow (report persistence)
│   ├── services/pdf_export.py     # Server-side professional PDF generation (reportlab)
│   ├── alembic/                   # DB migrations (initial · analysis_started_at · token_version · user role)
│   ├── tests/                     # 55 pytest tests (auth · projects · reports · orchestrator · agents · rbac · admin · cookie)
│   ├── database.py                # Async engine + session factory + SQLite FK pragma
│   ├── models.py                  # User / Project / Report ORM models
│   ├── schemas.py                 # Pydantic models + input validation constraints
│   ├── main.py                    # FastAPI app · CORS · security headers · lifespan
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Env var template
│
└── frontend/                      # Next.js 16 application
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx               # Landing page
    │   │   ├── (auth)/                # login · register
    │   │   ├── dashboard/             # dashboard · new · project/[id]
    │   │   ├── layout.tsx             # Root layout · metadata · viewport
    │   │   ├── globals.css            # Design system + themes
    │   │   └── icon.svg · favicon.ico · apple-icon.png · opengraph-image.png
    │   ├── components/                # UI kit · theme toggle · confirm dialog
    │   └── lib/
    │       ├── api.ts                 # Typed API client + token management
    │       └── utils.ts               # cn() helper (clsx + tailwind-merge)
    ├── next.config.ts                 # CSP + security headers
    └── package.json
```

---

## Quick Start ![Quick Start](https://img.shields.io/badge/Quick%20Start-6366f1?style=flat-square&logo=terminal&logoColor=white)

### Prerequisites

| Tool             | Version     | Why                                        |
| ---------------- | ----------- | ------------------------------------------ |
| Python           | 3.10+       | Runs the FastAPI backend                   |
| Node.js          | 18.18+ (20 recommended) | Runs the Next.js frontend    |
| npm              | 9+          | Frontend package manager                   |
| Groq API key     | —           | Powers the agent swarm (free tier available) |

### Backend — FastAPI

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Unix: source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# SECRET_KEY:  python -c "import secrets; print(secrets.token_urlsafe(48))"
# GROQ_API_KEY: your Groq key
# DATABASE_URL: leave the SQLite default, or paste a Neon/Postgres URL
# REDIS_URL: optional, e.g. redis://default:PASSWORD@host.db.redis.io:PORT

uvicorn main:app --reload --port 8000
```

- Interactive API docs (Swagger UI): <http://localhost:8000/docs>
- Tables are created automatically on startup — no manual migration step for dev.
- A bare `postgresql://` URL is auto-upgraded to the `asyncpg` driver, and libpq-only params (`sslmode`, `channel_binding`) are stripped, so Neon/RDS URLs work as-is.
- For existing databases (SQLite or Postgres) created before `token_version` existed, a guarded startup compatibility step adds the column automatically.

### Frontend — Next.js

```bash
cd frontend
npm install

echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
echo NEXT_PUBLIC_SITE_URL=http://localhost:3000 >> .env.local

npm run dev
```

Open <http://localhost:3000>, register an account, and launch your first validation.

### First Run Walkthrough

1. Register an account (email + password, **8–72 characters**).
2. Click **New Startup Idea**, fill in title and description (target audience and industry are optional), and save.
3. Click **Analyze Idea** — the card turns cyan ("Swarm Running...").
4. Within seconds-to-a-minute the project completes and **View Report** opens the tabbed report:
   - **Overview** — the executive verdict, summary, and key takeaways.
   - **Market / Competitors / Risk** tabs with structured findings.
   - **Download PDF** — server-side generated, professional A4 document with branded watermark, identical on every device.
5. Re-analyze any time with the **Re-analyze** button; delete with the trash icon (confirmed via dialog).

---

## Environment Variables ![Environment Variables](https://img.shields.io/badge/Environment%20Variables-ef4444?style=flat-square&logo=gear&logoColor=white)

### Backend — `backend/.env`

| Variable       | Required | Default                                  | Description                                          |
| -------------- | :------: | ---------------------------------------- | ---------------------------------------------------- |
| `SECRET_KEY`   | **Yes**  | —                                        | JWT signing secret. API refuses to start without it. |
| `GROQ_API_KEY` | **Yes**  | —                                        | Groq API key for the agent swarm.                    |
| `GROQ_MODEL`   |    No    | `openai/gpt-oss-120b`                | Agent model. Supports enforced JSON output. The `groq/compound` / `groq/compound-mini` models enable built-in web search but can hit intermittent 413 "Request Entity Too Large" errors on Groq's free tier. |
| `DATABASE_URL` |    No    | `sqlite+aiosqlite:///./startuplaunch.db` | Async DB URL — use Postgres/Neon in production.      |
| `CORS_ORIGINS` |    No    | `http://localhost:3000`                  | Comma-separated allowed frontend origins.            |
| `REDIS_URL`    |    No    | —                                        | Redis connection string; enables Redis-backed rate limiting (multi-worker). Use `redis://` for plain TCP, `rediss://` for TLS. |
| `ADMIN_EMAILS` |    No    | —                                        | Comma-separated emails promoted to the `admin` role on startup (case-insensitive). |
| `COOKIE_SECURE`|    No    | off                                      | Set to `true` in production to send the session cookie with `Secure` + `SameSite=None`. |

> **Note:** a bare `postgresql://` URL is automatically upgraded to the `asyncpg` driver and libpq-only query params (`sslmode`, `channel_binding`) are stripped, so Neon/RDS connection strings work as-is.

> **Redis:** when `REDIS_URL` is set (and the `redis` package is installed), startup logs `Using Redis-backed rate limiting` and every rate-limit attempt is stored as a Redis sorted-set key under the `sl_ratelimit:*` prefix. When unset, an in-process sliding window is used — fine for a single worker. Redis Cloud URLs such as `redis://default:<password>@<host>.db.redis.io:<port>` work as-is; use `rediss://` only if your instance requires TLS.

### Frontend — `frontend/.env.local`

| Variable               |  Required  | Description                                               |
| ---------------------- | :--------: | --------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Yes (prod) | Backend base URL, e.g. `https://your-api.railway.app`     |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Deployed frontend URL, e.g. `https://your-app.vercel.app` |

---

## API Reference ![API Reference](https://img.shields.io/badge/API%20Reference-3b82f6?style=flat-square&logo=code&logoColor=white)

### Endpoints

> All endpoints except `register`, `login`, `logout` and `/` authenticate via an `Authorization: Bearer <token>` header **or** the HttpOnly `access_token` session cookie set at login. Cookie-authenticated state-changing requests (POST/PUT/PATCH/DELETE) are additionally checked for a matching `Origin` header (CSRF), except when a Bearer token is supplied in the header.

| Method   | Endpoint                     | Description                                                        |
| -------- | ---------------------------- | ------------------------------------------------------------------ |
| `GET`    | `/`                          | API health / welcome                                               |
| `POST`   | `/api/auth/register`         | Create an account (email + password, 8–72 chars)                   |
| `POST`   | `/api/auth/login`            | OAuth2 form login → returns JWT `access_token` **and sets an HttpOnly session cookie** |
| `POST`   | `/api/auth/logout`           | Clear the session cookie (idempotent, no auth required)            |
| `GET`    | `/api/auth/me`               | Current user profile incl. `role` (drives admin UI affordances)     |
| `POST`   | `/api/auth/change-password`  | Change password; **revokes all outstanding sessions**              |
| `GET`    | `/api/admin/summary`         | **Admin-only** platform counts (users, projects, statuses) — 403 for the `user` role |
| `POST`   | `/api/projects/`             | Create a project (title, description, target_audience?, industry?) |
| `GET`    | `/api/projects/`             | List the current user's projects — search & filter server-side     |
| `GET`    | `/api/projects/{id}`         | Project detail including its report                                |
| `POST`   | `/api/projects/{id}/analyze` | Kick off the swarm in the background (rate-limited per user)       |
| `DELETE` | `/api/projects/{id}`         | Delete a project + report (cascade)                                |
| `GET`    | `/api/reports/{id}`          | Fetch a report by id (owner-scoped, 403 otherwise)                   |
| `GET`    | `/api/reports/{id}/pdf`      | Download a professional server-side PDF of the report (owner-scoped) |

### Query Parameters & Rate Limits

**`GET /api/projects/`**

| Param    | Type   | Default | Constraints              | Description                             |
| -------- | ------ | ------- | ------------------------ | --------------------------------------- |
| `skip`   | int    | `0`     | `>= 0`                   | Offset for pagination                   |
| `limit`  | int    | `100`   | `1–100`                  | Page size                               |
| `search` | string | —       | `<= 200` chars           | Case-insensitive match on title, description, industry |
| `status` | string | —       | any value                | Exact status filter (pending/analyzing/completed/failed) |

**Auth rate limits** (sliding window, per 15 minutes)

| Action             | Per IP  | Per email | Per user |
| ------------------ | :-----: | :-------: | :------: |
| Register           | 10      | 5         | —        |
| Login              | 10      | 5         | —        |
| Analyze (swarm)    | —       | —         | 5        |

### End-to-End Example (curl)

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

# 5. List with server-side search + status filter
curl -G http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer <TOKEN>" \
  --data-urlencode "search=code review" \
  --data-urlencode "status=completed"

# 6. Change password (revokes all existing tokens)
curl -X POST http://localhost:8000/api/auth/change-password \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"current_password":"supersecret","new_password":"evenbettersecret"}'

# 7. Download the professional PDF report (saved as <title>.pdf)
curl -X GET http://localhost:8000/api/reports/1/pdf \
  -H "Authorization: Bearer <TOKEN>" \
  --output report.pdf
```

### Report Schema

The persisted report lives in `Report.content` (JSON). A successful run contains:

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

If any agent fails (rate limit, timeout, invalid output), the run fails and the project is marked `failed` — so you always know the analysis did not finish, and you can simply re-run. No section is ever presented as a complete report when it wasn't.

### PDF Export

`GET /api/reports/{id}/pdf` renders the report into a professional A4 PDF on the server (`reportlab`), so every device downloads the exact same document. The export includes the project header, an AI verdict banner (color-coded Go / No-Go / Pivot), executive summary with key takeaways, TAM/SAM/SOM metrics, and bulleted competitor/risk findings — plus a diagonal semi-transparent watermark on every page. The legacy report shapes (`specialized_reports`, `market_research`, etc.) are handled automatically.

---

## Data Model ![Data Model](https://img.shields.io/badge/Data%20Model-84cc16?style=flat-square&logo=database&logoColor=white)

```text
users ──1── N── projects ──1── 1── reports
 id                id                 id
 email (unique)    title              project_id (FK, CASCADE)
 hashed_password   description        content (JSON)
 token_version     target_audience    executive_summary
 is_active         industry           pdf_url
 role              status             created_at
 created_at        analysis_started_at
                   user_id (FK, CASCADE)
```

- `users.email` is stored lowercased; lookups are case-insensitive.
- `users.token_version` is incremented on password change — every JWT embeds the version at issue time, so older tokens are instantly rejected.
- `users.role` defaults to `user`; emails listed in `ADMIN_EMAILS` are promoted to `admin` at startup (idempotent). Roles are embedded in JWTs and enforced by the `require_role` dependency.
- `projects.status` cycles `pending → analyzing → completed | failed`.
- Deleting a project cascades to its report (ORM and DB-level `ON DELETE CASCADE`).

---

## CRUD Operations ![CRUD Operations](https://img.shields.io/badge/CRUD-84cc16?style=flat-square&logo=tasks&logoColor=white)

The application implements a full authenticated CRUD workflow over the `projects` (and `reports`) resource:

| Operation | Frontend | API |
| --------- | -------- | --- |
| **Create** | "New Startup Idea" form (`/dashboard/new`) submit → project created and the swarm auto-dispatched | `POST /api/projects/` |
| **Read** | Dashboard lists the user's projects; report viewer opens a project detail (`/dashboard/project/[id]`) | `GET /api/projects/`, `GET /api/projects/{id}`, `GET /api/reports/{id}` |
| **Update** | Re-analyze replaces the report on the existing project; report content is written by the workflow | `POST /api/projects/{id}/analyze`, `POST /api/auth/change-password` |
| **Delete** | Trash icon → confirm dialog → row removed | `DELETE /api/projects/{id}` (cascades to report) |

All reads are owner-scoped server-side; a different user's project returns `403/404`. Analysis pushes the newest report plus `status` back to the database in the background workflow.

## Role-Based Access Control (RBAC) ![RBAC](https://img.shields.io/badge/RBAC-8b5cf6?style=flat-square&logo=shield&logoColor=white)

- **Roles:** `user` (default) and `admin`. Stored on the `users` table (`role` column) and embedded in JWT claims for convenience.
- **Provisioning:** emails listed in the `ADMIN_EMAILS` env var are promoted to `admin` at startup (idempotent, case-insensitive).
- **Enforcement:** `require_role(...)` dependency (`backend/api/deps.py`) re-reads the role from the **database row on every request** — a forged JWT claiming `role=admin` is still rejected, because the token claim is never trusted. `get_current_admin` guards `GET /api/admin/summary` (admins see platform counts; regular users get `403`).
- **Frontend:** `GET /api/auth/me` returns the current user's role so the dashboard can show the Admin panel — but this is presentation only; access control is enforced server-side.

**Role checks are verified by tests** (`tests/test_rbac.py`, `tests/test_admin.py`): default role, role claim in tokens, `ADMIN_EMAILS` promotion, `require_role` allow/deny, and non-admin `403` against the admin endpoint.

## Search & Filtering ![Search & Filtering](https://img.shields.io/badge/Search%20%26%20Filtering-0ea5e9?style=flat-square&logo=search&logoColor=white)

- **Search:** case-insensitive match on `title`, `description` and `industry` — executed **server-side** with a 400 ms debounce on the client.
- **Status filter:** `all / completed / analyzing / pending / failed` buttons, sent as a query param.
- **Pagination:** skip/limit paging with a "Load More Ideas" button (page size 100); search, filter and pagination compose because the filter lives on the server.
- **Polling:** while any project is `analyzing`, the dashboard refreshes statuses every 4 seconds (3 seconds on the detail page) so completed runs appear without a manual reload.

---

## Testing & Quality ![Testing & Quality](https://img.shields.io/badge/Testing%20%26%20Quality-22c55e?style=flat-square&logo=flask&logoColor=white)

### Backend — pytest (55 tests)

```bash
cd backend
venv\Scripts\python.exe -m pytest tests -q
# 55 passed — auth (10) · projects (10) · reports (6) · orchestrator (3) · agents (7) · rbac (7) · cookie-auth (6) · admin (6)
```

Covered behaviors include:

- **Auth**: registration, duplicate emails, case-insensitive matching, weak/invalid input rejection, wrong/unknown/inactive-user logins, and **token revocation on password change**.
- **Projects**: full lifecycle, atomic run claiming, stale-run recovery sweeps, pagination validation, cross-user access denial, **server-side search & status filtering**, **failed-run marking**, and **per-user analyze rate limiting**.
- **Reports**: ownership enforcement (403), 404 handling, auth requirement, and **server-side PDF export** (valid PDF bytes, correct content-type, download filename, and cross-user 403 on the `/pdf` endpoint).
- **Orchestrator**: full 4-section report shape (three specialists + executive verdict), failure propagation from any agent.
- **Agents**: strict JSON extraction (markdown fences rejected, missing/invalid JSON raises), and default model check (`openai/gpt-oss-120b`).
- **RBAC**: default `user` role on registration, role embedded in JWT claims, admin promotion via `ADMIN_EMAILS`, `require_role` enforcement (403 for the wrong role), and **DB-row (not token-claim) role enforcement against a forged admin token**.
- **Admin**: current-user profile endpoint (`/api/auth/me`), admin-only `/api/admin/summary` returning 403 for regular users, 401 unauthenticated, and correct aggregated counts for admins.
- **Cookie auth**: HttpOnly session cookie set on login, cookie-only requests authenticate, CSRF Origin-check on cookie-authenticated unsafe requests, and logout clearing the session.

### Frontend — quality gates

```bash
cd frontend
npx tsc --noEmit      # typecheck
npm run lint          # ESLint
npm run test          # Vitest (23 tests)
npm run build         # production build
```

All four gates are green in CI-style local runs (zero TypeScript errors, zero lint errors, 23 passing Vitest tests, successful production build).

---

## CI/CD ![CI/CD](https://img.shields.io/badge/CI%2FCD-374151?style=flat-square&logo=githubactions&logoColor=white)

GitHub Actions (`.github/workflows/ci.yml`) runs automatically on every push to `main` and on pull requests. It validates both tiers — no secrets are exposed to the workflow:

| Job | What it runs | Gates |
| --- | ------------ | ----- |
| **Backend** (`python 3.12`) | `python -m pytest tests -q` | All 55 backend tests |
| **Frontend** (`node 22`) | `npm run lint` · `npx tsc --noEmit` · `npm run test` · `npm run build` | Lint, TypeScript, 23 Vitest tests, production build |

The workflow only reads public dependencies and code already in the repository; API keys and `SECRET_KEY` are never required for the pipeline (tests run with dummy/test keys).

---

## Performance & Reliability ![Performance & Reliability](https://img.shields.io/badge/Performance%20%26%20Reliability-14b8a6?style=flat-square&logo=activity&logoColor=white)

| Concern              | Behavior                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| Swarm timeout        | Hard **120-second cap** per run so a hung LLM call never blocks forever.   |
| Stuck-run recovery   | Runs stuck in `analyzing` are swept to `failed` after **10 minutes** at startup and before re-analysis — safe to re-dispatch. |
| Double-dispatch      | Runs are claimed with a single atomic `UPDATE`; concurrent requests return 400. |
| Polling              | Dashboard polls every **4 seconds** while any run is `analyzing`.          |
| Transient failures   | No application-level retries; the OpenAI SDK's built-in retry (default `max_retries=2`) automatically resends transient/429 errors, honoring the server-reported wait. If an agent still errors, the run is failed and never fabricates a report. |
| Failed runs          | A failed run marks the project `failed` (never a fabricated report); re-dispatch anytime to retry. |
| LLM spend control    | Swarm dispatch is rate-limited to 5 runs / 15 minutes per user.            |

---

## Deployment ![Deployment](https://img.shields.io/badge/Deployment-0ea5e9?style=flat-square&logo=cloud&logoColor=white)

**Live demo:** [https://startuplaunchai-aui.vercel.app](https://startuplaunchai-aui.vercel.app) · **Full deployment guide:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

<table>
<tr>
<td width="50%" valign="top" style="border-top:5px solid #000;border-radius:10px;padding:16px;background:#fafafa">

#### Frontend → Vercel

1. Push the repo to GitHub and import it into Vercel.
2. Set **Root Directory** to `frontend`.
3. Add env vars: `NEXT_PUBLIC_API_URL` → backend URL, `NEXT_PUBLIC_SITE_URL` → Vercel URL.
4. Deploy — the landing page is fully static; dashboard and auth need the backend URL.
5. The `next.config.ts` security headers (CSP, `nosniff`, `X-Frame-Options`, `Referrer-Policy`) are applied automatically.

</td>
<td width="50%" valign="top" style="border-top:5px solid #009688;border-radius:10px;padding:16px;background:#f7fbfb">

#### Backend → Railway / Render / Fly.io

FastAPI + SQLite cannot persist on serverless. Deploy the backend on a long-running platform:

1. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
2. Set env vars: `SECRET_KEY`, `GROQ_API_KEY`, `CORS_ORIGINS` (your Vercel URL), `DATABASE_URL` (managed **PostgreSQL** — works with Neon/RDS).
3. For multi-worker deploys, set `REDIS_URL` to share rate-limit state across processes.
4. Tables are auto-created on startup (`Base.metadata.create_all`).

</td>
</tr>
</table>

### Database Migrations

Dev mode auto-creates tables (`create_all`) plus guarded startup compatibility steps that add the `token_version` and `role` columns to older databases. For production schema changes, use the checked-in Alembic migrations:

```bash
cd backend
alembic upgrade head
```

Four migrations are provided, chained `c6fe7409bd81 → a1b2c3d4e5f6 → b1b2c3d4e5f7 → d3b5c7e9f0a1`: the initial schema, `analysis_started_at`, `token_version`, and `user role`.

---

## Security ![Security](https://img.shields.io/badge/Security-dc2626?style=flat-square&logo=shield&logoColor=white)

| Area             | Implementation                                                                        |
| ---------------- | ------------------------------------------------------------------------------------- |
| Secrets          | Fail-closed — `SECRET_KEY` and `GROQ_API_KEY` never ship with defaults. The API refuses to start without `SECRET_KEY`. |
| Passwords        | bcrypt hashing with 72-byte enforcement; 8-char minimum, 72-char maximum policy.       |
| Sessions         | JWT (HS256) with 7-day expiry; server only trusts signed tokens.                      |
| Revocation       | `token_version` claim — a password change bumps the version and instantly invalidates every previously-issued token. |
| Brute-force      | Sliding-window rate limiting — 10/15 min per IP, 5/15 min per email (register & login), 5/15 min per user (analyze). |
| Authorization    | Owner-scoped queries — every project/report filtered by the authenticated user; cross-user access returns 403/404. Role-based access via `require_role` (e.g. `admin`-only endpoints). |
| Token storage    | JWTs are delivered in an HttpOnly cookie (`access_token`, 7-day, `SameSite=Lax` in dev / `Secure` + `SameSite=None` when `COOKIE_SECURE=true`) instead of `localStorage`, mitigating XSS token theft. |
| CSRF            | Cookie-authenticated state-changing requests (POST/PUT/PATCH/DELETE) must send a matching `Origin` header, except when a `Bearer` token is supplied; `login`, `register` and `logout` are exempt as entry/exit points. |
| Headers (API)    | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. |
| Headers (web)    | Strict CSP (`default-src 'self'`, no `object-src`, `frame-ancestors 'none'`, scoped `connect-src`) + `nosniff` + `X-Frame-Options` + `Referrer-Policy`. |
| Input validation | Pydantic constraints — title ≤120, description ≤4000, search ≤200, blank/whitespace rejected, payloads trimmed. |
| Repo hygiene      | `.env`, `venv/`, `*.db`, build artifacts and logs gitignored; `.env.example` is the committed template. |

---

## Limitations ![Limitations](https://img.shields.io/badge/Limitations-f59e0b?style=flat-square&logo=info&logoColor=white)

Honest, known limitations of the current implementation:

| Area | Limitation |
| ---- | ---------- |
| AI knowledge | The default model (`openai/gpt-oss-120b`) answers from its own training knowledge. Live web search is opt-in via `GROQ_MODEL=groq/compound-mini`, which can hit intermittent `413 Request Entity Too Large` errors on Groq's free tier. Figures from agents are estimates, not market data subscriptions. |
| Admin UI | Admin functionality is currently a platform-summary panel (counts). There is no user-management console (suspend, role change, delete user) — roles are provisioned via `ADMIN_EMAILS` at startup. |
| Email flows | No email verification or password-reset emails (a roadmap item). Passwords are changed after login only. |
| Rate limiter scope | Without `REDIS_URL`, rate limiting is in-process per worker. Multi-worker production deployments should set `REDIS_URL`. |
| DB migrations in dev | Dev auto-creates tables (`create_all`); production schema evolution is intended to go through Alembic. |
| Deliberate scale choices | No full-text index on search (uses `ILIKE`/`LIKE`), no image/CDN pipeline, no background task queue (FastAPI `BackgroundTasks` — fine for single-process, not a durable job queue). |

---

## Roadmap & Future Improvements ![Roadmap](https://img.shields.io/badge/Roadmap-f59e0b?style=flat-square&logo=map&logoColor=white)

| Status   | Item                                                    |
| :------: | ------------------------------------------------------- |
|   Done   | Production Postgres support (asyncpg + Neon-ready)      |
|   Done   | Redis-backed rate limiting for multi-worker deploys     |
|   Done   | Server-side search & status filtering on the dashboard  |
|   Done   | Token revocation via password change                    |
|   Done   | CSP + security headers on both tiers                    |
|   Done   | HttpOnly-cookie sessions with Origin-based CSRF guard   |
|   Done   | Role-based access control (roles, `ADMIN_EMAILS`, `require_role`) |
|   Next    | Docker Compose one-command local setup                   |
|   Next    | Report history / diffing across re-analyses             |
|  Planned | Industry-specific agent tuning and custom agent builder |
|  Planned | Email verification and password reset flows             |
|  Planned | Stripe billing for a SaaS tier                          |

---

## FAQ ![FAQ](https://img.shields.io/badge/FAQ-64748b?style=flat-square&logo=book&logoColor=white)

<details>
<summary><b>How does the validation actually work?</b></summary>
You describe your idea, and the orchestrator dispatches three specialist agents — Market Research, Competitor Analysis, Risk Assessment — in parallel, each analyzing from its own knowledge and labeling uncertain figures as estimates. An Executive Decision agent then synthesizes their findings into a Go / No-Go / Pivot verdict with an executive summary and key takeaways. Everything is stored as structured JSON and rendered as a tabbed report.
</details>

<details>
<summary><b>Does this work with live web search?</b></summary>
Live web search is off by default. The default model (`openai/gpt-oss-120b`) answers from its own knowledge with uncertain figures labeled as estimates. You can opt into Groq's built-in web search by setting `GROQ_MODEL=groq/compound-mini`, but note the compound models can hit intermittent 413 "Request Entity Too Large" errors on Groq's free tier.
</details>

<details>
<summary><b>Which LLM powers the agents?</b></summary>
The swarm runs on Groq's `openai/gpt-oss-120b` (enforced JSON output), accessed through the OpenAI SDK pointed at Groq's OpenAI-compatible endpoint. Set `GROQ_MODEL` to switch models — e.g. `groq/compound-mini` opts into live web search. Model and instructions are configurable in `backend/agents/base.py` and `backend/agents/specialized.py`.
</details>

<details>
<summary><b>How long does an analysis take?</b></summary>
Most runs complete in under a minute (the three specialists run in parallel, so the latency is roughly one agent's answer time). Every swarm run is capped at a hard 120-second timeout so a hung LLM call can never block forever.
</details>

<details>
<summary><b>What happens if one agent fails mid-run?</b></summary>
If any agent fails mid-run, the whole run fails and the project is marked `failed` so you can re-run. Nothing partial is ever shown as complete.
</details>

<details>
<summary><b>Can I re-run an analysis on the same project?</b></summary>
Yes. Re-dispatching replaces the previous report. If a run is left stuck in "analyzing" (e.g. after a server restart), it auto-recovers after 10 minutes so you can safely re-run.
</details>

<details>
<summary><b>How is the PDF report generated?</b></summary>
Server-side with `reportlab`. Clicking **Export PDF** downloads a real `.pdf` file (A4, branded, watermarked) straight from `GET /api/reports/{id}/pdf` — no browser print dialog, so the document looks identical on every device and browser.
</details>

<details>
<summary><b>How does password change affect my sessions?</b></summary>
Every JWT embeds a token version. Changing your password bumps that version, so all tokens issued before the change are rejected immediately — you'll need to log in again on every device.
</details>

<details>
<summary><b>Is my data private?</b></summary>
Yes. Authentication is required, and every project and report query is scoped to the authenticated user. Reports are only visible to their owner (cross-user access returns 403).
</details>

<details>
<summary><b>Why do I get 429 / rate-limit errors during analysis?</b></summary>
The free Groq tier allows a limited number of tokens per minute (TPM). Running several analyses back-to-back can exhaust that minute's budget. The swarm handles this gracefully: all Groq calls are serialized through one gate, and retries are handled by the OpenAI SDK's built-in policy (default `max_retries=2`), which honors the exact wait time Groq reports on a 429 before resending — so a run completes on the first free minute instead of failing right away. The application code never retries on its own, so if a call still errors after the SDK's bounded retries, the run is marked `failed` rather than fabricating a report. Waiting ~30-60 seconds before re-running also helps on the free tier.
</details>

<details>
<summary><b>Can I host the backend on Vercel?</b></summary>
Not for a full deployment. The backend is an async FastAPI service with file-based SQLite storage by default — use a long-running platform (Railway, Render, Fly.io) with a managed PostgreSQL database instead.
</details>

<details>
<summary><b>SQLite or PostgreSQL?</b></summary>
SQLite works out of the box for local development (`DATABASE_URL` default). For production, set `DATABASE_URL` to a Postgres URL (e.g. Neon) — tables are auto-created on startup and Alembic migrations are provided.
</details>

<details>
<summary><b>Why Redis?</b></summary>
Rate limiting uses an in-process sliding window by default — perfect for single-worker dev. When `REDIS_URL` is set, it switches to a Redis sorted-set backend so limits stay consistent across multiple workers in production. You can confirm it's active from the startup log (`Using Redis-backed rate limiting`) or by listing the `sl_ratelimit:*` keys in Redis after a login/register attempt.
</details>

---

## Contributing ![Contributing](https://img.shields.io/badge/Contributing-334155?style=flat-square&logo=gitpullrequest&logoColor=white)

Contributions are welcome and appreciated. To contribute:

1. **Fork** the repository.
2. **Create** a feature branch: `git checkout -b feat/your-feature`.
3. **Commit** your changes with a clear message.
4. **Push** to the branch and open a **Pull Request**.

Please keep the quality gates green before submitting:

```bash
cd backend && python -m pytest tests -q           # all 55 tests pass
cd frontend && npx tsc --noEmit && npm run lint && npm run test
```

Report bugs and request features via [GitHub Issues](https://github.com/afaqulislam/startuplaunch-ai/issues).

---

## Author & License ![Author & License](https://img.shields.io/badge/Author%20%26%20License-0f172a?style=flat-square&logo=github&logoColor=white)

<div align="center">

**Afaq Ul Islam** — Product & Engineering

[![GitHub](https://img.shields.io/badge/GitHub-afaqulislam-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/afaqulislam)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-afaqulislam-0A66C2?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/afaqulislam)
[![X](https://img.shields.io/badge/X-%40afaqulislam708-000000?logo=x&logoColor=white&style=for-the-badge)](https://x.com/afaqulislam708)

<br>

**StartupLaunch AI** — _Powered by Autonomous Agent Swarms._

Released under the [MIT License](LICENSE).

</div>
