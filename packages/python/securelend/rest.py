"""REST transport for the SecureLend platform. Tokens and bodies are not logged."""

import json
from typing import Any, Optional
from urllib.parse import urlencode

from .utils.errors import (
    AuthenticationError,
    ConsentRequiredError,
    FeatureDisabledError,
    InvalidTransitionError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
)

CONSENT_CODES = {"consent_required", "consent_revoked", "consent_expired"}


def _interpret(response: Any, feature_gated: bool) -> Any:
    text = response.content or b""
    payload: Any = {}
    if text:
        try:
            payload = response.json()
        except Exception:
            payload = {}
    status = int(response.status_code)
    code = str(payload.get("error") or "") if isinstance(payload, dict) else ""
    details = {"status": status, "error": code or None}
    if 200 <= status < 300:
        return payload
    if status == 401 or code == "invalid_signature":
        raise AuthenticationError("The API key was not accepted.")
    if status == 429:
        raise RateLimitError("The request was rate limited.")
    if code in CONSENT_CODES:
        raise ConsentRequiredError(
            "This consent was revoked." if code == "consent_revoked" else "A live consent is required before this package can be read.",
            details,
        )
    if code == "invalid_transition":
        raise InvalidTransitionError("That outcome is not available.", details)
    if feature_gated and status == 404:
        raise FeatureDisabledError("This feature is off for this workspace.", details)
    if status == 404:
        raise NotFoundError("The record was not found.")
    if status >= 500:
        raise ServerError("The server could not complete the request.")
    raise ValidationError("The request was not accepted.", details)


async def request_json(
    method: str,
    url: str,
    *,
    api_key: Optional[str] = None,
    body: Any = None,
    query: Optional[dict] = None,
    feature_gated: bool = False,
    idempotency_key: Optional[str] = None,
    max_retries: int = 2,
) -> Any:
    import httpx

    target = url
    if query:
        pairs = {key: value for key, value in query.items() if value is not None and value != ""}
        if pairs:
            target = f"{url}?{urlencode(pairs)}"
    headers = {"accept": "application/json"}
    token = str(api_key or "").strip()
    if token:
        headers["authorization"] = token if token.lower().startswith("bearer ") else f"Bearer {token}"
    content = None
    if body is not None:
        headers["content-type"] = "application/json"
        content = json.dumps(body)
    if idempotency_key and method.upper() in {"POST", "PUT", "PATCH"}:
        headers["idempotency-key"] = idempotency_key
    last_error: Optional[Exception] = None
    async with httpx.AsyncClient(timeout=30) as client:
        for attempt in range(max_retries + 1):
            try:
                response = await client.request(method, target, headers=headers, content=content)
            except httpx.HTTPError as exc:
                last_error = NetworkError("The request did not reach the server.")
                if attempt < max_retries:
                    continue
                raise last_error from exc
            if response.status_code == 429 or response.status_code >= 500:
                if attempt < max_retries:
                    continue
            return _interpret(response, feature_gated)
    raise last_error or NetworkError("The request did not reach the server.")
