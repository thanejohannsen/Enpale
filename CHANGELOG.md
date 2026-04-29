# Changelog

A running log of meaningful changes to the Enpale codebase. Use this to recover context when debugging — what changed, why, and where to look.

Format: reverse-chronological. Each entry has a date, a one-line summary, and details (what / why / files / follow-ups).

---

## 2026-04-29

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
