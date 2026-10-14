import pytest
from unittest.mock import AsyncMock, patch

from securelend import FeatureDisabledError, SecureLend, ValidationError, WebhookSignatureError
from securelend.rest import _interpret
from securelend.webhooks import parse_event, sign_outcome_payload, sign_webhook, verify_webhook


@pytest.fixture(autouse=True)
def mock_mcp_client():
    with patch("securelend.client.MCPClient", autospec=True) as mocked:
        yield mocked


class _Response:
    def __init__(self, status, payload):
        self.status_code = status
        self._payload = payload
        self.content = b"{}"

    def json(self):
        return self._payload


def test_comparison_host_stays_on_the_mcp_default(mock_mcp_client):
    SecureLend()
    mock_mcp_client.assert_called_with(api_key="", mcp_url="https://mcp.securelend.ai/mcp")


@pytest.mark.asyncio
async def test_decline_without_reason_does_not_call_the_api():
    client = SecureLend(api_key="test.admin.ten_a.ada")
    with patch("securelend.rest.request_json", new_callable=AsyncMock) as request:
        with pytest.raises(ValidationError):
            await client.record_outcome("enquiry_1", {"state": "declined"})
        request.assert_not_called()


@pytest.mark.asyncio
async def test_funded_without_amount_does_not_call_the_api():
    client = SecureLend()
    with patch("securelend.rest.request_json", new_callable=AsyncMock) as request:
        with pytest.raises(ValidationError):
            await client.record_outcome("enquiry_1", {"state": "funded", "fundedOn": "2026-10-14"})
        request.assert_not_called()


@pytest.mark.asyncio
async def test_record_outcome_uses_the_rest_base():
    client = SecureLend(api_key="test.admin.ten_a.ada")
    with patch("securelend.rest.request_json", new_callable=AsyncMock) as request:
        request.return_value = {"id": "out_1", "state": "viewed"}
        saved = await client.record_outcome("enquiry_1", {"state": "viewed"})
        assert saved["id"] == "out_1"
        args, kwargs = request.call_args
        assert args == ("POST", "https://securelend.ai/v1/leads/enquiry_1/outcomes")
        assert kwargs["feature_gated"] is True
        assert "mcp.securelend.ai" not in args[1]


def test_flag_off_is_feature_disabled():
    with pytest.raises(FeatureDisabledError):
        _interpret(_Response(404, {"error": "not_found"}), True)


def test_webhook_accepts_platform_and_rejects_replay():
    raw = '{"leadId":"enquiry_1","state":"viewed"}'
    header = sign_outcome_payload(raw, "hook-secret")
    assert verify_webhook(raw, header, "hook-secret") is True
    with pytest.raises(WebhookSignatureError):
        verify_webhook(raw + " ", header, "hook-secret")
    stamped = sign_webhook(raw, "hook-secret", 1_700_000_000)
    assert verify_webhook(raw, stamped, "hook-secret", now_ms=1_700_000_000_000) is True
    with pytest.raises(WebhookSignatureError):
        verify_webhook(raw, stamped, "hook-secret", now_ms=1_700_000_000_000 + 301_000)


def test_parse_event_keeps_unknown_types():
    event = parse_event(
        {
            "type": "lead.future",
            "id": "evt_1",
            "createdAt": "2026-10-14T00:00:00.000Z",
            "tenantId": "ten_a",
        }
    )
    assert event["type"] == "lead.future"
    assert event["data"] == {}


def test_client_sign_matches_platform_header():
    client = SecureLend()
    raw = '{"ok":true}'
    assert client.sign_outcome_payload(raw, "hook-secret") == sign_outcome_payload(raw, "hook-secret")
    assert client.parse_event(
        {
            "type": "outcome.recorded",
            "id": "evt_2",
            "createdAt": "2026-10-14T00:00:00.000Z",
            "tenantId": "ten_a",
            "data": {"state": "funded"},
        }
    )["data"]["state"] == "funded"
