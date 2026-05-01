import json
import re


def extract_json(raw: str) -> dict:
    """Parse a JSON object from a Claude response, tolerating markdown fences.

    Claude occasionally wraps JSON in ```json ... ``` despite instructions.
    This strips fences and parses; raises JSONDecodeError on real failure
    so the caller can retry with a stricter prompt.
    """
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"```\s*$", "", raw, flags=re.MULTILINE)
    return json.loads(raw.strip())


def sanitize_kid_input(text: str) -> str:
    """Strip characters that could be used for prompt injection.

    The kid's message will be wrapped in <kid_message>...</kid_message>
    XML tags before being sent to Claude, so we strip the chars that
    could close those tags or open new ones.
    """
    return re.sub(r"[<>{}]", "", text).strip()
