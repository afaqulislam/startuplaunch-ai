# StartupLaunch AI — Week 4 Screenshot Guide

**Repo:** https://github.com/afaqulislam/startuplaunch-ai
**Live demo:** https://startuplaunchai-aui.vercel.app

How to capture the evidence screenshots for the submission. All screenshots come from the **deployed** live site (real browser, real data), so save them with the live backend connected and a real analysis completed. Store them in `docs/screenshots/` and link them in the final report.

Filename pattern: `01-landing.png`, `02-login.png`, … (see table below). Use default laptop/desktop window size and the light theme unless noted.

---

## Screenshot list (desktop-first)

| # | Filename | Where | What to show | Maps to (task/criteria) |
| - | -------- | ----- | ------------ | ----------------------- |
| 1 | `01-landing.png` | `/` | Full landing page hero + "Analyze my startup idea" CTA + stats band | Responsive UI, hero |
| 2 | `02-login.png` | `/login` | Login form (email + password) | Auth |
| 3 | `03-register.png` | `/register` | Register form with name + password confirmation | Auth |
| 4 | `04-dashboard-empty.png` | `/dashboard` (fresh user) | Empty state with "Create your first startup idea" CTA | DB persistence, UX empty state |
| 5 | `05-new-idea.png` | `/dashboard/new` | New Startup Idea form (title, description, target audience, industry) | CRUD create, forms |
| 6 | `06-dashboard-list.png` | `/dashboard` (after creating) | Project cards + search bar + status filter buttons | Dashboard, search/filter UI |
| 7 | `07-analyzing.png` | `/dashboard` | A project card in **Analyzing** state with spinner | AI workflow, progress states |
| 8 | `08-report-completed.png` | `/dashboard/project/[id]` | Completed report: executive verdict banner + summary + takeaways | AI multi-agent output, report viewer |
| 9 | `09-report-tab-market.png` | report page → Market tab | Market Research tab content | API integration, 4-section report |
| 10 | `10-report-tab-competitor.png` | report page → Competitor tab | Competitor Analysis tab | API integration |
| 11 | `11-report-tab-risk.png` | report page → Risk tab | Risk Assessment tab + verdict | API integration |
| 12 | `12-pdf-download.png` | report page → PDF button | PDF open/finished download | PDF export |
| 13 | `13-delete-confirm.png` | `/dashboard` → delete → confirm | Delete confirmation dialog | CRUD delete |
| 14 | `14-admin-panel.png` | `/dashboard` (admin account) | Admin Platform Summary panel (users/projects/completed/failed) | RBAC admin feature (new) |
| 15 | `15-error-404.png` | `/dashboard/project/nonexistent` | "not found" state | Error handling |
| 16 | `16-failed-analysis.png` | a project that failed | Failed state + retry action | Error handling, AI failure |
| 17 | `17-mobile-dashboard.png` | `/dashboard` at 375×667 | Responsive mobile layout (use DevTools device toolbar) | Responsive UI |
| 18 | `18-mobile-report.png` | report page at 375×667 | Tabs + verdict render on mobile | Responsive UI |
| 19 | `19-deployed-terminal.png` | deployment dashboard | CI pipeline green + deployed domain | CI/CD, deployment |

Add if desired: `20-lighthouse.png` after running Lighthouse on the deployed site (Performance/Accessibility/Best Practices/SEO) — then paste the scores into the final report §21 and the checklist row 42.

---

## Notes and guardrails

- **Only real UI is captured** — no mockups or fabricated screenshots.
- If the deployed backend is not yet reachable, screenshots 5–16 and 18 **cannot** be produced; the submitted report must then mark them "To be measured" rather than substitute fakes.
- The admin panel (14) requires an account whose email is in the backend `ADMIN_EMAILS` env var — sign up with that email before the backend starts so it promotes to `admin`.
- Keep screenshots to the viewport; PNG format, `docs/screenshots/`.
- Business identity to avoid for the demo idea: pick a non-conflicting fictional idea (e.g. a niche local service) for the sample report screenshots.