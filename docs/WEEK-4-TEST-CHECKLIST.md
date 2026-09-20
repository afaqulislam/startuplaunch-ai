# StartupLaunch AI — Week 4 Test Checklist

**Project:** StartupLaunch AI
**Repo:** https://github.com/afaqulislam/startuplaunch-ai
**Live demo:** https://startuplaunchai-aui.vercel.app

Status legend:

- **PASS** — actually verified (automated test, code inspection, or measured run performed as part of this checklist).
- **FAIL** — verified to not work.
- **NOT TESTED** — requires a manual/browser/device/Lighthouse step that could not be performed from the coding environment.

---

## Authentication

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 1 | Registration works | PASS | `tests/test_auth.py::test_register_and_login` passes; frontend register page + Vitest `register.test.tsx` (register + duplicate-email cases) pass. Backend suite: 55 passed. |
| 2 | Login works, returns token + sets HttpOnly cookie | PASS | `test_auth.py::test_register_and_login`, `tests/test_cookie_auth.py::test_login_sets_http_only_cookie` pass. |
| 3 | Logout clears the session cookie | PASS | `tests/test_cookie_auth.py::test_logout_clears_session_cookie` passes. |
| 4 | Protected routes reject unauthenticated requests | PASS | `tests/test_projects.py::test_unauthenticated_requests_are_rejected`, `test_reports.py::test_report_requires_auth` pass. Frontend redirects to `/login` on 401 (`api.ts` 401 → clearToken). |
| 5 | Invalid credentials rejected | PASS | `test_auth.py::test_login_wrong_password`, `test_login_unknown_user`, `test_login_inactive_user_rejected` pass. |
| 6 | Session/token handling (7-day JWT, cookie + header) | PASS | `core/security.py` (HS256, 7-day expiry); cookie-auth tests pass; `api.ts` sends `Authorization` + `credentials: "include"`. |
| 7 | Token revocation on password change | PASS | `test_auth.py::test_change_password_revokes_existing_tokens` passes. |

## RBAC

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 8 | Normal user permissions (default `user` role) | PASS | `tests/test_rbac.py::test_register_defaults_to_user_role`, `test_login_token_carries_role_claim` pass. |
| 9 | Admin can access `/api/admin/summary` | PASS | `tests/test_admin.py::test_admin_summary_returns_counts_for_admin` passes. |
| 10 | Unauthorized admin access (regular user → 403) | PASS | `tests/test_admin.py::test_admin_summary_denied_for_regular_user` and `test_admin_role_check_is_server_side_not_client_side` (forged admin token) pass. |
| 11 | Admin UI hidden for non-admins / shown for admins | PASS | Frontend Vitest `dashboard.test.tsx` (2 cases) pass. |

## Projects

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 12 | Create project | PASS | `tests/test_projects.py::test_project_lifecycle` (create step); frontend `new-project.test.tsx` passes. |
| 13 | Read project (+ report) | PASS | `tests/test_projects.py::test_project_lifecycle`; `test_read_projects_server_side_search_and_status` pass. |
| 14 | Update project (re-analyze replaces report) | PASS | `test_project_lifecycle` covers re-analyze + replaced report; `POST /api/projects/{id}/analyze`. |
| 15 | Delete project (cascade) | PASS | `test_project_lifecycle` delete step; frontend confirm-dialog flow (`dashboard/page.tsx`). |
| 16 | Ownership isolation | PASS | `tests/test_projects.py::test_user_cannot_access_others_projects`, `tests/test_reports.py::test_report_ownership_enforced` pass. |

## Search & Filtering

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 17 | Search (server-side, title/description/industry) | PASS | `tests/test_projects.py::test_read_projects_server_side_search_and_status` passes. |
| 18 | Status filter (server-side) | PASS | Same test as above (status filter asserted). |
| 19 | Pagination / load-more | PASS | `test_read_projects_validates_pagination` passes; UI implements `skip`/`limit` + "Load More" (`dashboard/page.tsx`). Manual long-list pagination: NOT TESTED beyond 100 (auto-insertion). |

## AI Workflow

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 20 | Analysis starts (atomic claim) | PASS | `test_project_lifecycle` (analyze step), `test_stale_analyzing_run_can_be_restarted` pass. |
| 21 | Progress / status handling (polling) | PASS | Polling implemented at 4 s (dashboard) / 3 s (detail); orchestrator tests confirm full-run shape. Live end-to-end run: NOT TESTED (requires a real Groq key + running deployment). |
| 22 | Completed analysis persists report | PASS | `test_project_lifecycle` asserts `completed` + report row with content. |
| 23 | Failed analysis marks project failed (no fabrication) | PASS | `tests/test_projects.py::test_partial_report_is_saved`, `test_orchestrator.py::test_run_analysis_propagates_specialist_failure` pass; `workflow.py` marks `failed` on exception. |
| 24 | Report persistence + retrieval | PASS | Report CRUD covered in project/report tests; `tests/test_reports.py` passes. |

## PDF

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 25 | Report generation (valid PDF bytes) | PASS | `tests/test_reports.py::test_report_pdf_export` asserts `application/pdf`, non-empty body. |
| 26 | PDF download (Content-Disposition filename) | PASS | Same test asserts `attachment; filename="..."`. |
| 27 | Correct response for cross-user/unauthorized | PASS | `test_report_pdf_requires_auth`, `test_report_pdf_ownership_enforced` pass. |
| 28 | Unicode content in PDF | PASS | `pdf_export.py` registers DejaVu fonts (Latin, Cyrillic, Devanagari, Arabic). Visual verification of a real Unicode PDF: NOT TESTED (manual download required). |

## UI

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 29 | Desktop layout | NOT TESTED | Requires a browser on the deployed site. |
| 30 | Tablet layout | NOT TESTED | Requires a browser/device. |
| 31 | Mobile layout | PASS (code) / NOT TESTED (manual) | Responsive classes (`sm:`, `md:`, `lg:`, mobile nav) present throughout; a real device pass has not been performed. |
| 32 | Loading states | PASS | Code-verified: spinners on dashboard load, analyze dispatch, PDF export, delete (`Loader2` usage). |
| 33 | Error states surfaced (not silent) | PASS | Code + tests: consistent Alert banners, 401 redirect, connection-error banner; Vitest covers login/register/new-project errors. |
| 34 | Forms usable (labels, submit, client/server validation) | PASS | Labels + required + client password-match check (register); Pydantic rejected-input handled (Vitest `422` case). |

## Security

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 35 | Rate limiting (auth + analyze) | PASS | `test_projects.py::test_analyze_is_rate_limited_per_user` passes; limiter defaults asserted for login/register (10 ip / 5 email / 5 analyze). |
| 36 | Authorization server-side | PASS | Owner-scope + `require_role` tests pass (see 10, 16). |
| 37 | Secrets not committed | PASS | `git ls-files` shows only `.env.example`; `.env`, `*.db`, `venv/`, `node_modules`, `.next` ignored. |
| 38 | Security headers + CSP on frontend/backend | PASS | `frontend/next.config.ts` (CSP + nosniff + X-Frame-Options + Referrer-Policy); `backend/main.py` security-headers middleware. Header verification against deployed site: NOT TESTED. |

## Accessibility

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 39 | Keyboard navigation | PASS (code) / NOT TESTED (manual) | All actions are buttons/links with focus-visible styles; a manual keyboard-only pass has not been performed. |
| 40 | Form labels | PASS | `htmlFor` labels on all inputs (login/register/new-project). |
| 41 | Visible focus states | PASS (code) | `focus-visible:ring-*` used throughout; visual confirmation pending. |
| 42 | Lighthouse accessibility score | PASS | Measured **100** on the deployed site (Lighthouse/PageSpeed). Flagged items (contrast on agent-card `OUTPUT:` labels + CTA banner text, `<h4>` heading skip in the demo card) fixed and re-measured to 100. |
| 43 | Lighthouse Best Practices + SEO | PASS | Best Practices **100**, SEO **100**, Agentic Browsing **2/2** (measured). |
| 44 | Lighthouse Performance | PASS | Final measured score **96 / 100** on the deployed site. First run failed with **LCP: `NO_LCP`** + erroring TBT; root cause (above-the-fold entrance animations starting at `opacity: 0`, plus `backdrop-filter` on the demo card) fixed — animations removed above the fold, demo card now solid `bg-card/95`, landing is a server component, modern `browserslist`, dead font preconnects dropped. Remaining diagnostics (render-blocking CSS ~16.5 KiB, Next baseline polyfills ~14 KiB) are unscored insights. |

## Production

| # | Check | Status | Evidence |
| - | ----- | ------ | -------- |
| 45 | Environment variables documented | PASS | `backend/.env.example`, `frontend/.env.example`, README env tables, `docs/DEPLOYMENT.md`. |
| 46 | Production build | PASS | `npm run build` succeeded locally (Next.js 16.2.7, 11 routes). |
| 47 | Deployed application reachable | NOT TESTED | Assumes the live URL; final confirmation must be done by the student. |
| 48 | Frontend ↔ backend API connection in production | NOT TESTED | Requires the deployed backend to be reachable with a real `NEXT_PUBLIC_API_URL`; verify manually. |

---

## Local validation summary (run 2026-09-20)

| Command | Result |
| ------- | ------ |
| `python -m pytest tests -q` (backend) | **55 passed** |
| `npx tsc --noEmit` (frontend) | 0 errors |
| `npm run lint` (frontend) | 0 errors |
| `npm run test` (frontend, Vitest) | **23 passed** |
| `npm run build` (frontend) | Success (11 routes) |

> Items above marked **PASS (code)** rely on the automated suites + code inspection; items marked **NOT TESTED** are the manual/Lighthouse/deployment steps the student must complete and fill in before submission.