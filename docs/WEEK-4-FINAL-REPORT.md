# StartupLaunch AI — Week 4 Final Report

**Project:** StartupLaunch AI — Autonomous AI Agent Swarms for Startup Idea Validation
**Submission:** Web Development — Final Task 1 (Production-Ready Full-Stack Web Application) & Final Task 2 (Deployment, Security & Performance)
**Live demo:** https://startuplaunchai-aui.vercel.app
**Repository:** https://github.com/afaqulislam/startuplaunch-ai

---

## 1. Project Title

**StartupLaunch AI** — a production-style, full-stack web application that uses a parallel swarm of specialized AI agents to validate startup ideas in minutes and deliver an evidence-backed **Go / No-Go / Pivot** verdict.

## 2. Project Overview

StartupLaunch AI is a Next.js + FastAPI monorepo. A founder submits a startup idea (title, description, target audience, industry). Three AI agents — Market Research, Competitor Analysis and Risk Assessment — analyze the idea **in parallel** on Groq (`openai/gpt-oss-120b`, enforced JSON output). A fourth Executive Decision agent synthesizes their findings into a structured report with a recommendation, an executive summary and key takeaways. Reports are persisted to a relational database, rendered as a tabbed dashboard view, and exportable to a professional server-side PDF. The whole application sits behind secure authentication, role-based access control, rate limiting, and full input validation.

## 3. Problem Statement

Most founders validate ideas with gut feel, biased friends, or expensive consultants. A structured research cycle — market sizing, competitive mapping and risk stress-testing — takes weeks and costs thousands, and the results are unstructured and hard to trust. There is no repeatable, evidence-driven way to get a Go / No-Go / Pivot decision before committing time and capital.

## 4. Proposed Solution

Automate the validation pipeline. Four specialized AI agents run in parallel and produce a consistent, structured, decision-ready report for every idea, every time:

1. Submit an idea.
2. Market / Competitor / Risk agents analyze concurrently (120-second hard cap, rate-limited dispatch).
3. The Executive agent returns a Go / No-Go / Pivot verdict with an executive summary and key takeaways.
4. The report is persisted, presented in a tabbed dashboard, and downloadable as a server-side PDF.

## 5. Target Users / Practical Use Case

| User | Practical use case |
| ---- | ------------------ |
| Founders | Pressure-test a startup idea before spending time or capital. |
| Product teams | Validate features, verticals and expansion bets. |
| Investors | Quick, structured due-diligence on incoming deals. |
| Accelerators | Screen cohorts with consistent, objective analysis. |

Each user gets an isolated workspace: projects and reports are owner-scoped, and a cross-user request returns 403/404.

## 6. Key Features

- **One-click validation** — describe an idea, dispatch the swarm, get a full-depth report.
- **Parallel agent swarm** — three specialists run concurrently, then an executive agent decides.
- **Decision-ready dashboard** — live status (`pending → analyzing → completed | failed`) with polling and metrics.
- **Server-side search & filter** — search by title/description/industry (400 ms debounce), status filter, paginated load-more that composes with both.
- **PDF export** — professional, branded, watermarked, device-independent PDF generated server-side with reportlab.
- **Crash-safe workflow** — stuck runs auto-recover after 10 minutes; each swarm run is capped at 120 seconds.
- **Secure authentication** — bcrypt hashing, HttpOnly-cookie JWT sessions, token revocation on password change.
- **Role-based access** — `user` / `admin` roles with a server-enforced admin-only endpoint and an admin panel.
- **Hardened by default** — CSP + security headers on both tiers, fail-closed secrets, owner-scoped queries, sliding-window rate limiting.
- **Dark/light mode, SEO + Open Graph ready.**
- **Admin platform summary** — achieved via a new `GET /api/admin/summary` endpoint (admin-only) and a dashboard Admin panel.

## 7. Technology Stack

**Frontend:** Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4 · lucide-react · next-themes · Vitest + Testing Library.

**Backend:** FastAPI (async) · Python 3.12 · SQLAlchemy 2 (async) · Alembic migrations · asyncpg · aiosqlite · python-jose (JWT) · bcrypt · reportlab (PDF).

**AI runtime:** Groq · `openai/gpt-oss-120b` · OpenAI SDK · enforced JSON output · parallel asyncio swarm.

**Data & infra:** SQLite (dev) / PostgreSQL–Neon (prod) · optional Redis-backed rate limiting · GitHub Actions CI.

## 8. System Architecture

Three tiers: a statically-rendered Next.js frontend; an async FastAPI API; and a relational database. The LLM is consumed server-side only (no API key ever reaches the browser).

```
Next.js (App Router)      FastAPI (async)              Database
────────────────────      ───────────────────          ─────────────
Landing / Auth pages      Auth (bcrypt + JWT +         users
Dashboard / Report        HttpOnly cookie, CSRF)       projects
Admin panel (badge)       Projects CRUD + search       reports
PDF download              Reports + server-side PDF
                          Admin summary (require_role)
                          Rate limiting (Redis/in-proc)
                          Agent swarm (Groq, parallel)
```

Key decisions: async-first stack; background-task analysis with polled status; server-side search/filter/pagination/PDF; security enforced in the API, not the UI.

## 9. Frontend

- Routes: `/` (landing), `/login`, `/register`, `/dashboard`, `/dashboard/new`, `/dashboard/project/[id]`.
- Typed API client (`src/lib/api.ts`) with in-memory token + HttpOnly-cookie fallback, `credentials: "include"`, automatic 401 → logout → login redirect.
- Dashboard: stats banner, search (debounced), status filter buttons, project cards, delete confirm dialog, analyze / re-analyze, 4-second polling while any run is analyzing.
- Report viewer: executive verdict banner, executive summary + takeaways, tabbed Market / Competitor / Risk sections, PDF download (blob), retry/failed/partial states.
- Admin: role-aware Admin panel (users/projects/completed/failed counts) shown only to the `admin` role.
- Responsive layouts (mobile nav, cards collapse from 3 → 2 → 1 column), dark/light theme, semantic labels and focus-visible rings.

## 10. Backend

- Pydantic-validated routers: auth (`register`, `login`, `logout`, `me`, `change-password`), admin (`summary`), projects (`create`, `list`, `detail`, `analyze`, `delete`), reports (`detail`, `pdf`).
- JWT dependency reads the Authorization header **or** the HttpOnly cookie; `require_role()` re-reads the role from the DB row on every request.
- Atomic run claiming (single `UPDATE`) prevents double-dispatch; stale runs are swept to `failed` after 10 minutes.
- Background analysis workflow persists the report and marks the project `completed` / `failed` (never a fabricated partial-as-complete result).
- Sliding-window rate limiting (in-process or Redis): 10/15 min per IP + 5/15 min per email (register & login); 5/15 min per user (analyze).
- Security headers middleware + CORS restricted to configured origins.

## 11. Database

- Tables: `users`, `projects`, `reports` (1:N projects:reports, cascade delete both ORM- and DB-level).
- `users`: email (lowercased, unique), hashed_password, `token_version` (session revocation), `role` (default `user`), `is_active`.
- `projects`: title, description, target_audience, industry, `status`, `analysis_started_at`, owner FK.
- `reports`: `content` (JSON report), executive_summary, pdf_url.
- SQLite default for dev with SQLAlchemy `create_all`; PostgreSQL/Neon for production. Four Alembic migrations are checked in (initial schema, `analysis_started_at`, `token_version`, `role`).

## 12. Authentication

- **Registration / login / logout** implemented and tested.
- Passwords hashed with **bcrypt** (72-byte limit enforced; 8–72 char policy).
- JWT (HS256, 7-day expiry) delivered in JSON **and** an HttpOnly cookie — never localStorage — mitigating XSS token theft.
- **Token revocation:** every JWT embeds the user's `token_version`; a password change bumps it and instantly invalidates all outstanding tokens (tested).
- Invalid credentials return a generic 401; inactive users are rejected.
- `GET /api/auth/me` exposes the authenticated user (id, email, role).

## 13. Role-Based Access Control

- Roles `user` (default) and `admin`, stored on the DB and mirrored into JWT claims.
- Admins provisioned via `ADMIN_EMAILS` at startup (idempotent, case-insensitive).
- `require_role()` dependency reads the role from the **database row**, so a forged token claiming `admin` still gets 403 (tested).
- `GET /api/admin/summary` is admin-only (403 for `user`); the frontend Admin panel is presentation only — enforcement is server-side.

## 14. CRUD Workflows

| Operation | Implementation |
| --------- | -------------- |
| Create | `POST /api/projects/` from the "New Startup Idea" form; swarm auto-dispatched. |
| Read | `GET /api/projects/` (list), `GET /api/projects/{id}` (detail incl. report). |
| Update | `POST /api/projects/{id}/analyze` replaces the report; `POST /api/auth/change-password`. |
| Delete | `DELETE /api/projects/{id}` with cascade to the report, from a confirm dialog. |

All scoped to the authenticated owner (cross-user 403/404), verified by tests.

## 15. Search and Filtering

- Server-side search across `title`, `description`, `industry` (case-insensitive), 400 ms client debounce.
- Status filter (`all / completed / analyzing / pending / failed`).
- Skip/limit pagination with a "Load More Ideas" button; the server handles all filtering so search + pagination compose correctly.
- Dashboard polls every 4 s (detail page 3 s) while a run is `analyzing`.

## 16. AI Multi-Agent Architecture

- BaseAgent → OpenAI-compatible Groq client with enforced `json_object` responses and a strict JSON extractor (rejects markdown fences / malformed / empty responses).
- Orchestrator runs Market, Competitor and Risk agents via `asyncio.gather`, then feeds the combined output to the Executive agent — wrapped in a 120-second timeout.
- Agents are instructed to label uncertain figures as estimates; a completed report is only produced from real agent output. A failure marks the project `failed` (never fabricated).

## 17. PDF Report Generation

`GET /api/reports/{id}/pdf` builds a professional A4 document server-side with **reportlab** (branded header, color-coded Go/No-Go/Pivot banner, executive summary, TAM/SAM/SOM, competitor and risk bullets, watermark). Bundled DejaVu fonts render Unicode (Arabic, Cyrillic, Devanagari…) instead of boxes. Cross-user access returns 403 (tested).

## 18. Validation and Error Handling

- **Input validation:** Pydantic constraints — title ≤ 120, description ≤ 4000, search ≤ 200, whitespace-only rejected, emails validated, password 8–72.
- **API errors:** FastAPI validation arrays are surfaced to the user in readable form on the frontend.
- **Error UX:** 404 → "not found" states; 401 → auto logout to login; failed analysis → explicit retry screen; connection failure → banner with reload hint; loading spinners throughout; empty states with a call-to-action. Nothing silently fails.

## 19. Security Implementation

- Fail-closed secrets: API refuses to start without `SECRET_KEY`; `GROQ_API_KEY` server-side only.
- bcrypt password hashing; JWT HS256 with 7-day expiry and revocation.
- HttpOnly + SameSite/Lax (Secure when `COOKIE_SECURE=true`) session cookie; CSRF Origin check on cookie-authenticated unsafe requests.
- Owner-scoped queries; `require_role` RBAC; server-side authorization (not client-side).
- CSP + security headers on both Next.js and FastAPI; rate limiting; input limits; `.env`/db/venv ignored; `.env.example` ships variable names only.
- Does not claim "100% secure" — see Limitations.

## 20. Performance Optimization

- Async engine throughout (asyncpg/aiosqlite); `pool_pre_ping`; background analysis keeps the request path fast.
- Server-side search/filter + pagination avoid pulling full tables to the client.
- 120-second swarm cap; 10-minute stale-run sweep; no polling when idle (polling only while `analyzing`).
- Runtime switches to Redis rate limiting for multi-worker deployments.
- Bundled fonts and minimal bundled assets; no large images in the frontend.

## 21. Accessibility

- Semantic HTML, `<label htmlFor>` on all inputs, `aria-label`/`aria-pressed`/`aria-live` where meaningful, keyboard-usable buttons, focus-visible rings, color-coded statuses that are also labeled text, responsive layouts with reduced motion support (`motion-reduce`).
- **Measured (Lighthouse/PageSpeed Insights, live site):** Accessibility **94** (remaining: contrast on some muted elements and one heading-order skip inside the demo card — fixable follow-ups). Best Practices **100**, SEO **100**, Agentic Browsing **2/2**.
- Performance was measured at **94 in the first run and has since had targeted optimizations applied** (landing converted to a server component with client islands, legacy-JS removed via modern browser targets, dead font preconnects removed) — the latest score is to be re-measured on the deployed site and recorded here.

## 22. Testing and QA

Command-line runs performed as part of this submission (see docs/WEEK-4-TEST-CHECKLIST.md for the full matrix):

- **Backend (pytest):** `python -m pytest tests -q` → **55 passed**.
  Coverage areas: auth (10), projects (10), reports (6), orchestrator (3), agents (7), rbac (7), admin (6), cookie-auth (6).
- **Frontend:** `npx tsc --noEmit` (0 errors) · `npm run lint` (0 errors) · `npm run test` (Vitest: **23 passed**) · `npm run build` (production build succeeded).

## 23. CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push to `main` and PRs:
- **Backend job:** Python 3.12, `pip install -r requirements.txt`, `pytest` (all backend tests).
- **Frontend job:** Node 22, `npm ci`, then `npm run lint` → `tsc --noEmit` → `npm run test` → `npm run build`.
- No secrets are used in the pipeline.

## 24. Deployment

- **Frontend:** Vercel, root directory `frontend`, env vars `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_SITE_URL`. Live at https://startuplaunchai-aui.vercel.app.
- **Backend:** long-running platform (Railway/Render/Fly.io), start command `uvicorn main:app --host 0.0.0.0 --port $PORT`, managed PostgreSQL (`DATABASE_URL`), `SECRET_KEY`, `GROQ_API_KEY`, `CORS_ORIGINS`, optional `REDIS_URL`, `ADMIN_EMAILS`, `COOKIE_SECURE=true`.
- **Migrations:** `alembic upgrade head` for production; dev auto-creates tables.
- Full guide: [docs/DEPLOYMENT.md](DEPLOYMENT.md).

## 25. Challenges Faced

- **LLM output reliability:** agents occasionally returned fenced/malformed JSON — solved with a strict extractor plus fail-loudly semantics so a report is never presented as complete unless it is.
- **Double-dispatch / crash recovery:** concurrent analyze requests or a mid-run restart could leave a run stuck or duplicated — solved with atomic `UPDATE` claiming and a 10-minute stale-run sweep.
- **Cookie vs header auth across origins:** dev (localhost→localhost) and cross-site production (Vercel→Railway) needed different `SameSite` behavior — solved with a `COOKIE_SECURE` switch plus CSRF Origin checks and Bearer-header fallback.
- **Schema evolution for early installs:** pre-`token_version`/pre-`role` databases crashed on auth — solved with guarded startup compatibility steps and Alembic migrations for fresh/production setups.
- **Date parsing across SQLite/Postgres:** SQLite returns naive datetimes browsers parse as invalid — normalized on the client.
- **Free-tier Groq limits:** per-user analysis rate limiting plus the SDK's bounded retries keep spend and failures predictable.

## 26. Technical Decisions

- **FastAPI (async) + SQLAlchemy async** for a non-blocking request and analysis path.
- **JWT in an HttpOnly cookie** (not localStorage) plus token-version revocation — stronger XSS posture than common token-in-array approaches.
- **Role read from the DB, not the JWT claim** — revocation/bus-change of role is immediate.
- **BackgroundTasks for analysis** — correct for single-process deploys; documented trade-off vs a durable queue.
- **Server-side PDF (reportlab)** — device-independent, reproducible documents with Unicode coverage.
- **Next.js static rendering + config-based CSP** — safe given every route is static; avoids nonces forcing dynamic rendering.

## 27. Results / Final Outcome

- A working, deployed full-stack application (frontend live at the URL above).
- Full Task 1 coverage: responsive UI, authentication, RBAC, DB persistence, CRUD, search/filter, validation, secure API integration, error handling, polished UX.
- Full Task 2 coverage: env config, secrets hygiene, server-side authorization, rate limiting, security headers/CSP, logging, performance-oriented queries, deployment documentation, test checklist.
- **Measured locally:** 55 backend tests and 23 frontend tests pass; typecheck, lint and production build are clean.
- **Measured on the deployed site:** Accessibility 94, Best Practices 100, SEO 100, Agentic Browsing 2/2 (Lighthouse/PageSpeed). Performance optimizations shipped (server-component landing, no legacy JS, dead preconnects removed); the final Performance score is to be re-measured after this batch is deployed.

## 28. Limitations

- Agent figures are estimates from the model's knowledge, not live market data (live search is opt-in via `GROQ_MODEL=groq/compound-mini`, with caveats on the free tier).
- Admin functionality is a platform summary; there is no user-management console yet (suspend/role-change/delete).
- No email verification / password-reset flows yet.
- Rate limiting is in-process unless `REDIS_URL` is set.
- Analysis runs via `BackgroundTasks`, which suits a single-process deployment, not a distributed worker fleet.
- Search uses SQL `ILIKE`/`LIKE` (no full-text index); no CDN/image pipeline.

## 29. Future Improvements

- Durable job queue (Celery/ARQ) for analysis, plus per-agent progress streaming.
- User-management admin console, email verification and password reset.
- Report history / diffing across re-analyses; industry-specific agent tuning.
- Full-text search, paginated cursors, and a CDN for generated assets.
- Docker Compose one-command local setup; Stripe billing for a SaaS tier.

## 30. GitHub and Live Demo Links

- **Live demo:** https://startuplaunchai-aui.vercel.app
- **Repository:** https://github.com/afaqulislam/startuplaunch-ai
- **README:** https://github.com/afaqulislam/startuplaunch-ai/blob/main/README.md
- **Docs:** `docs/DEPLOYMENT.md`, `docs/WEEK-4-TEST-CHECKLIST.md`, `docs/WEEK-4-SCREENSHOT-GUIDE.md` (in this repository)