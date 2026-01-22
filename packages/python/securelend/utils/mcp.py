import json
from typing import Any, Dict

import httpx
from httpx_sse import aconnect_sse

from ..utils.errors import (
    AuthenticationError,
    NetworkError,
    RateLimitError,
    ServerError,
)


class MCPClient:
    def __init__(self, *, api_key: str, mcp_url: str):
        self._api_key = api_key
        self._mcp_url = mcp_url
        self._debug = False

    async def call_tool(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        headers = {
            "User-Agent": f"securelend-python/{__import__('securelend').__version__}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        }
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"

        if self._debug:
            print(f"[SecureLend SDK] Calling tool '{name}' with args: {args}")

        body = {
            "jsonrpc": "2.0",
            "method": "tool/call",
            "params": {"name": name, "arguments": args},
            "id": 1,
        }

        try:
            async with httpx.AsyncClient() as client:
                async with aconnect_sse(
                    client, "POST", self._mcp_url, headers=headers, json=body, timeout=30.0
                ) as event_source:
                    async for event in event_source.aiter_sse():
                        if event.event == "result":
                            try:
                                result_data = json.loads(event.data)
                                return result_data.get("result", {})
                            except json.JSONDecodeError as e:
                                raise ServerError(
                                    f"Failed to parse tool result JSON: {e}"
                                ) from e
                        if event.event == "error":
                            error_data = json.loads(event.data)
                            raise ServerError(
                                f"MCP Error: {error_data.get('message', 'Unknown error')} "
                                f"(Code: {error_data.get('code')})"
                            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (401, 403):
                raise AuthenticationError("Authentication failed.") from e
            if e.response.status_code == 429:
                retry_after_header = e.response.headers.get("Retry-After")
                retry_after = None
                if retry_after_header and retry_after_header.isdigit():
                    retry_after = int(retry_after_header)
                raise RateLimitError("Rate limit exceeded.", retry_after=retry_after) from e
            if e.response.status_code >= 500:
                raise ServerError(f"Server error: {e.response.text}") from e
            raise NetworkError(f"HTTP error: {e}") from e
        except httpx.RequestError as e:
            raise NetworkError(f"Network error: {e}") from e

        raise ServerError("No result received from MCP server.")

    async def connect(self) -> None:
        pass  # Connection is handled per-request in this implementation

    async def close(self):
        pass  # No persistent connection to close

    def set_api_key(self, api_key: str) -> None:
        self._api_key = api_key

    def enable_debug(self) -> None:
        self._debug = True

    def disable_debug(self) -> None:
        self._debug = False
