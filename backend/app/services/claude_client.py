from functools import lru_cache

from anthropic import Anthropic

from app.config import settings


@lru_cache(maxsize=1)
def get_claude_client() -> Anthropic:
    return Anthropic(api_key=settings.anthropic_api_key)
