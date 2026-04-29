# Enpale

**EN**gagement + **PA**ssion + **LE**arning — a kids educational platform (ages 6–13) where each kid grows a village of personalized AI-generated games (Enpas) that they collect, play, and level up.

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the full design.

## Stack

- **Frontend:** React + TypeScript + Tailwind + Vite
- **Backend:** Python 3.12+ + FastAPI
- **AI:** Anthropic Claude (`claude-sonnet-4-6`)
- **Persistence (MVP):** localStorage + IndexedDB

## Local development

### Prerequisites
- Python 3.12+ (3.14 works)
- Node 20+
- An Anthropic API key (https://console.anthropic.com)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate    # Windows Git Bash
# or: .venv\Scripts\activate     # Windows cmd / PowerShell
pip install -r requirements.txt
cp .env.example .env             # then paste your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

Smoke test: `curl http://localhost:8000/healthz`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Status

Phase 0 — Scaffolding.
