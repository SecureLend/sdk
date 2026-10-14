"""Webhook signing for lender outcomes and timestamped events."""

import hashlib
import hmac
import json
import time
from typing import Any, Mapping, Optional, Union

from .utils.errors import ValidationError, WebhookSignatureError

Raw = Union[str, bytes]


def _bytes(raw: Raw) -> bytes:
    if isinstance(raw, bytes):
        return raw
    return raw.encode("utf-8")


def sign_outcome_payload(raw: Raw, secret: str) -> str:
    """Header for POST /v1/webhooks/lender-outcomes. sha256 of secret + '.' + body."""
    digest = hashlib.sha256()
    digest.update(str(secret or "").encode("utf-8"))
    digest.update(b".")
    digest.update(_bytes(raw))
    return "sha256=" + digest.hexdigest()


def sign_webhook(raw: Raw, secret: str, timestamp_sec: Optional[int] = None) -> str:
    """Timestamped HMAC-SHA256. Header shape: t=<unix>,v1=<hex>."""
    stamp = int(time.time()) if timestamp_sec is None else int(timestamp_sec)
    mac = hmac.new(str(secret or "").encode("utf-8"), f"{stamp}.".encode("utf-8") + _bytes(raw), hashlib.sha256)
    return f"t={stamp},v1={mac.hexdigest()}"


def _equal(expected: str, presented: str) -> bool:
    return hmac.compare_digest(expected.encode("utf-8"), presented.encode("utf-8"))


def verify_webhook(
    raw: Raw,
    signature_header: Optional[str],
    secret: str,
    tolerance_sec: int = 300,
    now_ms: Optional[int] = None,
) -> bool:
    header = str(signature_header or "").strip()
    key = str(secret or "")
    if not key or not header:
        raise WebhookSignatureError("Webhook signature did not match.")
    if ",v1=" in header and "t=" in header:
        try:
            stamp_text, mac = header.split(",v1=", 1)
            stamp = int(stamp_text.split("t=", 1)[1])
        except (ValueError, IndexError) as exc:
            raise WebhookSignatureError("Webhook signature did not match.") from exc
        now_sec = int(time.time()) if now_ms is None else int(now_ms / 1000)
        if abs(now_sec - stamp) > tolerance_sec:
            raise WebhookSignatureError("This webhook is outside the time window.")
        expected = sign_webhook(raw, key, stamp).split("v1=", 1)[1]
        if not _equal(expected, mac.strip().lower()):
            raise WebhookSignatureError("Webhook signature did not match.")
        return True
    presented = header[7:] if header.lower().startswith("sha256=") else header
    expected = sign_outcome_payload(raw, key)[7:]
    if not _equal(expected, presented.strip().lower()):
        raise WebhookSignatureError("Webhook signature did not match.")
    return True


def parse_event(payload: Mapping[str, Any]) -> dict:
    """Unknown event types are kept. A missing type is rejected."""
    if not isinstance(payload, Mapping):
        raise ValidationError("The webhook event did not match the expected shape.")
    event_type = payload.get("type")
    event_id = payload.get("id")
    created_at = payload.get("createdAt")
    tenant_id = payload.get("tenantId")
    if not all(isinstance(value, str) and value for value in (event_type, event_id, created_at, tenant_id)):
        raise ValidationError("The webhook event did not match the expected shape.")
    data = payload.get("data") if isinstance(payload.get("data"), dict) else {}
    return {
        "type": event_type,
        "id": event_id,
        "createdAt": created_at,
        "tenantId": tenant_id,
        "data": data,
    }


def dumps_event(event: Mapping[str, Any]) -> str:
    return json.dumps(event, separators=(",", ":"))
