from typing import Literal

from pydantic import BaseModel, Field

AgeGroup = Literal["early_elementary", "late_elementary", "middle_school"]
GameStyle = Literal["building", "action", "puzzle", "exploring"]
AttentionSpan = Literal["short", "medium", "long"]
ChatRole = Literal["user", "assistant"]


class ChatMessage(BaseModel):
    role: ChatRole
    content: str


class TopicSelectRequest(BaseModel):
    topic_ids: list[str] = Field(..., min_length=1, max_length=4)
    kid_name: str
    age: int = Field(..., ge=6, le=13)


class TopicSelectResponse(BaseModel):
    session_id: str
    opening_message: str


class ChatRequest(BaseModel):
    session_id: str
    topic_ids: list[str]
    kid_name: str
    age: int = Field(..., ge=6, le=13)
    history: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    ready_to_build: bool


class FinalizeRequest(BaseModel):
    session_id: str
    topic_ids: list[str]
    kid_name: str
    age: int = Field(..., ge=6, le=13)
    age_group: AgeGroup
    history: list[ChatMessage]


class InterestProfile(BaseModel):
    session_id: str
    kid_name: str
    age: int
    age_group: AgeGroup
    primary_interest: str
    secondary_interests: list[str] = Field(default_factory=list, max_length=3)
    excitement_keywords: list[str] = Field(default_factory=list)
    preferred_game_style: GameStyle
    attention_span_signal: AttentionSpan
    chat_summary: str
    notable_quotes: list[str] = Field(default_factory=list)
