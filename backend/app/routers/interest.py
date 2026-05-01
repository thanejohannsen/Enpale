from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.interest_profile import (
    ChatRequest,
    ChatResponse,
    FinalizeRequest,
    InterestProfile,
    TopicSelectRequest,
    TopicSelectResponse,
)
from app.services import interest_service

router = APIRouter(prefix="/interest", tags=["interest"])


def _require_key() -> None:
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY not set. Add it to backend/.env and restart the server.",
        )


@router.post("/topics", response_model=TopicSelectResponse)
def select_topics(req: TopicSelectRequest) -> TopicSelectResponse:
    _require_key()
    session_id, opening = interest_service.start_session(
        kid_name=req.kid_name,
        age=req.age,
        topic_ids=req.topic_ids,
    )
    return TopicSelectResponse(session_id=session_id, opening_message=opening)


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    _require_key()
    if not req.history:
        raise HTTPException(status_code=400, detail="history must contain at least one message")
    reply, ready = interest_service.chat_turn(req.history)
    return ChatResponse(reply=reply, ready_to_build=ready)


@router.post("/finalize", response_model=InterestProfile)
def finalize(req: FinalizeRequest) -> InterestProfile:
    _require_key()
    if len(req.history) < 2:
        raise HTTPException(status_code=400, detail="history must contain at least one full exchange")
    return interest_service.finalize_profile(
        session_id=req.session_id,
        kid_name=req.kid_name,
        age=req.age,
        age_group=req.age_group,
        history=req.history,
    )
