# Changelog

A running log of meaningful changes to the Enpale codebase. Use this to recover context when debugging — what changed, why, and where to look.

Format: reverse-chronological. Each entry has a date, a one-line summary, and details (what / why / files / follow-ups).

---

## 2026-04-29

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
