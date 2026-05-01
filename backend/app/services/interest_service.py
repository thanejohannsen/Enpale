import uuid

from app.config import settings
from app.models.interest_profile import (
    AgeGroup,
    ChatMessage,
    InterestProfile,
)
from app.prompts.interest_prompts import (
    FINALIZE_SYSTEM_PROMPT,
    SPARKY_OPENING_USER_TEMPLATE,
    SPARKY_SYSTEM_PROMPT,
)
from app.services.claude_client import get_claude_client
from app.utils.json_utils import extract_json, sanitize_kid_input

READY_TOKEN = "[READY_TO_BUILD]"


def _format_history_for_claude(history: list[ChatMessage]) -> list[dict]:
    """Convert ChatMessage history to Anthropic SDK message dicts.

    Kid messages (role=user) are sanitized and wrapped in <kid_message>
    tags so prompt-injection attempts via the chat input fail open.
    """
    formatted = []
    for msg in history:
        if msg.role == "user":
            safe = sanitize_kid_input(msg.content)
            content = f"<kid_message>{safe}</kid_message>"
        else:
            content = msg.content
        formatted.append({"role": msg.role, "content": content})
    return formatted


def start_session(kid_name: str, age: int, topic_ids: list[str]) -> tuple[str, str]:
    """Create a new session, ask Claude for the opening Sparky message.

    Returns (session_id, opening_message).
    """
    session_id = str(uuid.uuid4())
    safe_name = sanitize_kid_input(kid_name) or "friend"
    topics_block = "\n".join(f"- {tid}" for tid in topic_ids)

    opening_user = SPARKY_OPENING_USER_TEMPLATE.format(
        kid_name=safe_name,
        age=age,
        topics=topics_block,
    )

    client = get_claude_client()
    response = client.messages.create(
        model=settings.claude_model,
        max_tokens=200,
        temperature=0.8,
        system=SPARKY_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": opening_user}],
    )
    opening = response.content[0].text if response.content else ""
    # Defense: strip the ready token if Claude jumped the gun
    opening = opening.replace(READY_TOKEN, "").strip()
    return session_id, opening


def chat_turn(history: list[ChatMessage]) -> tuple[str, bool]:
    """Run one Sparky turn over the supplied history.

    Returns (reply_text_with_token_stripped, ready_to_build).
    """
    client = get_claude_client()
    response = client.messages.create(
        model=settings.claude_model,
        max_tokens=200,
        temperature=0.8,
        system=SPARKY_SYSTEM_PROMPT,
        messages=_format_history_for_claude(history),
    )
    raw = response.content[0].text if response.content else ""
    ready = READY_TOKEN in raw
    cleaned = raw.replace(READY_TOKEN, "").strip()
    return cleaned, ready


def finalize_profile(
    session_id: str,
    kid_name: str,
    age: int,
    age_group: AgeGroup,
    history: list[ChatMessage],
) -> InterestProfile:
    """Synthesize the chat into a structured InterestProfile."""
    transcript_lines = []
    for msg in history:
        speaker = "Kid" if msg.role == "user" else "Sparky"
        text = sanitize_kid_input(msg.content) if msg.role == "user" else msg.content
        transcript_lines.append(f"{speaker}: {text}")
    transcript = "\n".join(transcript_lines)

    user_payload = (
        f"Kid name: {sanitize_kid_input(kid_name)}\n"
        f"Age: {age}\n\n"
        f"Conversation transcript:\n<transcript>\n{transcript}\n</transcript>\n\n"
        "Output ONLY the InterestProfile JSON now."
    )

    client = get_claude_client()

    def _call(strict_retry: bool = False) -> str:
        system = FINALIZE_SYSTEM_PROMPT
        if strict_retry:
            system += "\n\nCRITICAL: Return ONLY raw JSON. No markdown fences. No explanation."
        response = client.messages.create(
            model=settings.claude_model,
            max_tokens=1024,
            temperature=0.1,
            system=system,
            messages=[{"role": "user", "content": user_payload}],
        )
        return response.content[0].text if response.content else ""

    raw = _call()
    try:
        parsed = extract_json(raw)
    except Exception:
        # Retry once with reinforced "raw JSON only" instruction
        raw = _call(strict_retry=True)
        parsed = extract_json(raw)

    return InterestProfile(
        session_id=session_id,
        kid_name=kid_name,
        age=age,
        age_group=age_group,
        **parsed,
    )
