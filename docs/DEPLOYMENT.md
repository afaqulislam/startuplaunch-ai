# StartupLaunch AI — Deployment Guide

**Repo:** https://github.com/afaqulislam/startuplaunch-ai
**Live frontend:** https://startuplaunchai-aui.vercel.app

Deployment consists of two tiers:

- **Frontend** — Next.js, deployed on **Vercel** (root `frontend`).
- **Backend** — FastAPI (async), deployed on a long-running platform (Railway, Render, or Fly.io) with a managed PostgreSQL database.

Both tiers are linked from the README and the Week 4 final report.

---

## 1. Environment variables

### Backend (`backend/.env`, copied from `.env.example`)

| Variable | Required | Default | Notes |
| -------- | -------- | ------- | ----- |
| `SECRET_KEY` | ✅ | — | Generate: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `GROQ_API_KEY` | ✅ (for agents) | — | Groq key used server-side only; never sent to the browser |
| `GROQ_MODEL` | — | `openai/gpt-oss-120b` | `groq/compound-mini` enables web search but can hit 413s on the free tier |
| `DATABASE_URL` | — | `sqlite+aiosqlite:///./startuplaunch.db` | Production: `postgresql+asyncpg://user:pass@host:5432/db` |
| `CORS_ORIGINS` | — | `http://localhost:3000` | Comma-separated frontend origins, e.g. `https://startuplaunchai-aui.vercel.app,http://localhost:3000` |
| `ADMIN_EMAILS` | — | — | Comma-separated emails promoted to `admin` at startup |
| `COOKIE_SECURE` | — | `false` | Set `true` in production so the session cookie uses `Secure; SameSite=None` (requires HTTPS) |
| `REDIS_URL` | — | — | Optional shared rate limiting (`rediss://` for TLS); in-process limiter when unset |

### Frontend (`frontend/.env.local` or Vercel project env, copied from `.env.example`)

| Variable | Required | Default | Notes |
| -------- | -------- | ------- | ----- |
| `NEXT_PUBLIC_API_URL` | ✅ in production | `http://localhost:8000` | Public URL of the deployed backend; also injected into the CSP `connect-src` |

---

## 2. Backend deployment (Railway/Render/Fly.io)

Any long-running container/VM works. Railway is used as the concrete example.

1. **Push the repo** and create a new Railway project from `github.com/afaqulislam/startuplaunch-ai`.
2. **Root directory:** `backend` (so `requirements.txt` is at the service root).
3. **Build:** `pip install -r requirements.txt`.
4. **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. **Provision** a managed **PostgreSQL** database and set `DATABASE_URL` to its `postgresql+asyncpg://` connection string.
6. **Set all env vars** from the table above. Use `COOKIE_SECURE=true` and `CORS_ORIGINS` including your Vercel URL and (for testing) `http://localhost:3000`.
7. **Run migrations** (production only — dev auto-creates tables):
   ```bash
   alembic upgrade head
   ```
8. **Verify:** `GET https://<your-backend>.<platform>/` returns the API root message and the interactive docs load at `/docs`.

> ⚠️ `fastapi[standard]` and `uvicorn` are pinned in `requirements.txt`; install `redis` (listed as optional) only if you set `REDIS_URL`.

---

## 3. Frontend deployment (Vercel)

1. In Vercel, **Import Project** from `github.com/afaqulislam/startuplaunch-ai`.
2. **Root directory:** `frontend`.
3. **Framework preset:** Next.js (Next.js 16 — Turbopack builds are supported by current Vercel).
4. **Environment variables:** set `NEXT_PUBLIC_API_URL` to the deployed backend URL. Because every page is statically rendered, this value is baked at build time.
5. **Deploy.** In production the browser calls the backend directly (`connect-src` in `next.config.ts` is set from `NEXT_PUBLIC_API_URL`), so the backend must allow the Vercel origin in `CORS_ORIGINS` and (because cookies are used) `allow_credentials=true` (already the default in `main.py`).
6. **Verify** the app end-to-end: register → create an idea → wait for `completed` → open the report → download the PDF.

**Alternative:** if you prefer zero cross-origin cookies, point `NEXT_PUBLIC_API_URL` at `/api` and add a Vercel `rewrites()`/`proxy` from `frontend/next.config.ts` to the backend — the frontend stays same-origin and the cookie becomes first-party.

---

## 4. Database migrations

Dev mode auto-creates tables (`create_all`) plus guarded startup steps that add the `token_version` and `role` columns to older databases.

For production schema changes, run the checked-in Alembic migrations (chain `c6fe7409bd81 → a1b2c3d4e5f6 → b1b2c3d4e5f7 → d3b5c7e9f0a1`):

```bash
cd backend
alembic upgrade head
```

Four migrations: initial schema → `analysis_started_at` → `token_version` → `user role`.

---

## 5. CI/CD

`.github/workflows/ci.yml` runs on push/PR:

- **Backend:** Python 3.12 → `pip install -r requirements.txt` → `python -m pytest tests -q` (55 tests).
- **Frontend:** Node 22 → `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run test` → `npm run build`.

No secrets are required in CI (tests run with dummy keys).

---

## 6. Go-live verification checklist (manual)

- [ ] Backend `/docs` reachable over HTTPS.
- [ ] `alembic upgrade head` applied against the production Postgres.
- [ ] A real end-to-end run completes (idea → analyzing → completed → report + PDF).
- [ ] Registering with an email listed in `ADMIN_EMAILS` (before backend start) yields the Admin panel on the dashboard.
- [ ] Cookie `Secure` flag set (check DevTools Application → Cookies with `COOKIE_SECURE=true`).
- [ ] Lighthouse measured on the live site and scores copied into `docs/WEEK-4-FINAL-REPORT.md` §21.
- [ ] `git ls-files` contains no `.env` files (only `.env.example`s) and no database files.

---

## 7. Running locally (dev reference)

```bash
# backend
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt        # Windows
cp .env.example .env                                 # then fill values
venv\Scripts\python -m uvicorn main:app --reload --port 8000

# frontend (new terminal)
cd frontend
npm ci
copy .env.example .env.local                         # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000. Local stack uses SQLite (`sqlite+aiosqlite:///./startuplaunch.db`) with auto-created tables.