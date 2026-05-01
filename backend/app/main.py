from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import interest as interest_router
from app.services.claude_client import get_claude_client

app = FastAPI(title="Enpale API", version="0.0.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All product endpoints live under /api/v1
app.include_router(interest_router.router, prefix="/api/v1")


@app.get("/healthz")
def healthz() -> dict:
    return {
        "status": "ok",
        "anthropic_key_set": bool(settings.anthropic_api_key),
        "model": settings.claude_model,
    }


@app.get("/smoke/claude")
def smoke_claude() -> dict:
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY is not set. Copy backend/.env.example to backend/.env and add your key.",
        )

    client = get_claude_client()
    msg = client.messages.create(
        model=settings.claude_model,
        max_tokens=64,
        messages=[
            {"role": "user", "content": "Reply with exactly the three words: enpale is online"}
        ],
    )
    reply_text = msg.content[0].text if msg.content else ""
    return {
        "reply": reply_text,
        "model": msg.model,
        "input_tokens": msg.usage.input_tokens,
        "output_tokens": msg.usage.output_tokens,
    }
