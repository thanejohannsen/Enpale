# Changelog

A running log of meaningful changes to the Enpale codebase. Use this to recover context when debugging — what changed, why, and where to look.

Format: reverse-chronological. Each entry has a date, a one-line summary, and details (what / why / files / follow-ups).

---

## 2026-04-30

### Phase 1 — Repository layer, types, WelcomePage, VillagePage
- **What:** Full persistence foundation for the MVP. Typed data models, repository interface + localStorage implementation, Zustand session store, hooks for reacting to data changes, and the first two real pages.
- **Why:** Phase 1 of IMPLEMENTATION_PLAN.md. Establishes the swap-point architecture (swap `repository/index.ts` exports when moving to API-backed persistence in Phase 2+) and gives us a clickable first-run flow.
- **Files added:**
  - `frontend/src/types/index.ts` — `KidProfile`, `Enpa`, `Checkpoint`, `EggColorPalette`, `AgeGroup`, `RarityTier`, `EnpaStatus`
  - `frontend/src/repository/types.ts` — `KidProfileRepository` + `EnpaRepository` interfaces
  - `frontend/src/repository/localStorageRepo.ts` — localStorage impl (Enpa metadata), idb-keyval (HTML blobs), emitters for hook re-renders
  - `frontend/src/repository/index.ts` — single named export; swap point for Phase 2 API repo
  - `frontend/src/store/sessionStore.ts` — Zustand: `sessionId`, `incubatingEnpaId` (ephemeral pipeline state only)
  - `frontend/src/hooks/useKidProfile.ts` — subscribes to `kidProfileEmitter`, returns `{ profile, loading }`
  - `frontend/src/hooks/useEnpaCollection.ts` — subscribes to `enpaCollectionEmitter`, returns `{ enpas, loading }`
- **Pages updated:**
  - `WelcomePage.tsx` — real form (name + age), validates, computes `ageGroup`, saves `KidProfile` via repo, redirects to village; checks on mount if profile exists and skips straight to village
  - `VillagePage.tsx` — reads `KidProfile` via hook, redirects to `/` if missing, shows header (name/XP/stats), empty-state egg placeholder, Enpa grid stub, floating "Hatch" CTA, leaderboard tab link
- **Storage layout:** `localStorage['enpale.kid_profile']` (KidProfile JSON), `localStorage['enpale.enpas']` (Enpa[] JSON, no HTML), IndexedDB key `enpale.enpa_html.<enpaId>` (HTML blob per Enpa)
- **Verified:** `tsc -b` passes with zero errors.
- **Follow-ups:** Phase 2 — topic cards (TopicSelectPage) + Sparky chat (ChatPage) + backend interest endpoints.

## 2026-04-29

### Frontend scaffolded — Vite + React 19 + Tailwind v4 + Router
- **What:** Created `frontend/` via `npm create vite@latest` (react-ts template). Added Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no separate config file — config-in-CSS), React Router v6, zustand, idb-keyval. Replaced boilerplate App.tsx with router that maps every page from the plan to a route. Each page is a stub backed by a shared `PageStub` component so we can click through the full nav skeleton.
- **Why:** Phase 0 scaffold per IMPLEMENTATION_PLAN.md. Stubs let later phases be filled in incrementally without rewiring routes.
- **Routes:** `/` (Welcome), `/village`, `/topics`, `/chat`, `/incubate/:enpaId`, `/enpa/:enpaId`, `/play/:enpaId`, `/leaderboard`, `*` → Welcome.
- **Files:** `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/src/index.css`, `frontend/src/components/PageStub.tsx`, `frontend/src/pages/*.tsx` (8 stubs), `frontend/src/api/client.ts`, `frontend/vite.config.ts`, `frontend/index.html`.
- **Vite proxy:** `/api` → `http://localhost:8000`, so frontend fetches go through Vite to FastAPI without CORS in dev.
- **Boilerplate removed:** `src/App.css`, `src/assets/`, `public/icons.svg`.
- **Verified:** `npm run build` succeeds (33 modules, 75KB gzip JS, 3.5KB gzip CSS). Dev server boots on `localhost:5173` and serves the React shell. Note: on Windows, use `localhost` not `127.0.0.1` — Vite binds IPv6-first.
- **Follow-ups:** Wire `apiGet/apiPost` to FastAPI `/healthz` from a page to confirm dev proxy works (Phase 1). Add `.env.example` for `VITE_API_BASE` if/when we move off the proxy.

### Backend scaffolded — FastAPI skeleton with Anthropic smoke test
- **What:** Created `backend/` with FastAPI app, `/healthz` and `/smoke/claude` endpoints, Anthropic SDK client wrapper, pydantic-settings config, CORS for the Vite dev server, and `.env.example` template.
- **Why:** Phase 0 of IMPLEMENTATION_PLAN.md — minimum viable backend that proves the Claude API call works and is ready for the 3-model pipeline to be layered on top.
- **Files:** `backend/app/main.py`, `backend/app/config.py`, `backend/app/services/claude_client.py`, `backend/requirements.txt`, `backend/.env.example`.
- **Pin notes:** Loosened version pins to `pydantic>=2.13` because Python 3.14 lacked prebuilt wheels for `pydantic-core` 2.27 (the version paired with pydantic 2.10). pydantic-core 2.46+ ships `cp314` wheels and works out of the box.
- **Verified:** `/healthz` returns `{"status":"ok","anthropic_key_set":false}` and `/smoke/claude` returns 503 with a friendly "set your key" message — exactly the expected pre-key state.
- **Follow-ups:** Frontend scaffold next. Once user adds `ANTHROPIC_API_KEY` to `backend/.env`, hit `/smoke/claude` to confirm Claude responds.

### Repo bootstrap — Phase 0 begins
- **What:** Initialized git repo locally, connected to `github.com/thanejohannsen/Enpale` (public), merged remote's `docs/IMPLEMENTATION_PLAN.md` with the local copy, consolidated to a single plan at repo root.
- **Why:** User created the GitHub repo via web UI which auto-committed the plan to `docs/`. Local-first workflow needed root copy. Kept root path because project is small — fewer directories to navigate.
- **Files:** `IMPLEMENTATION_PLAN.md` (root, kept), `docs/IMPLEMENTATION_PLAN.md` (deleted), `.gitignore` (new), `README.md` (new), `CHANGELOG.md` (this file, new).
- **.gitignore covers:** Python (`__pycache__`, `.venv`), Node (`node_modules`, `dist`), secrets (`.env`), IDE (`.vscode`, `.idea`), Claude Code local config (`.claude/`).
- **Follow-ups:** Phase 0 still pending — backend scaffold (FastAPI + Anthropic SDK + smoke test) and frontend scaffold (Vite + React + TS + Tailwind).

---

<!--
Template for new entries:

## YYYY-MM-DD

### One-line summary of the change
- **What:** What concretely changed.
- **Why:** Motivation. Bug? Feature? Refactor? User decision? Link the cause.
- **Files:** Key files touched.
- **Follow-ups:** Anything left undone, known issues, or planned next steps.
-->
