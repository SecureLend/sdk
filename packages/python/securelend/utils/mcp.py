import httpx
from typing import Any, Dict, Optional

from ..types import ToolResult
from ..utils.errors import AuthenticationError, NetworkError, ServerError


class MCPClient:
    def __init__(self, *, api_key: str, mcp_url: str):
        self._api_key = api_key
        self._mcp_url = mcp_url
        self._debug = False
        self._is_connected = False
        self._client: Optional[httpx.AsyncClient] = None

    async def connect(self) -> None:
        if self._is_connected and self._client:
            return

        if self._debug:
            print(f"[SecureLend SDK] Connecting to MCP server at {self._mcp_url}")

        self._client = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "User-Agent": f"securelend-python/{__import__('securelend').__version__}",
                "Content-Type": "application/json",
            }
        )
        self._is_connected = True

    async def _ensure_connected(self) -> None:
        if not self._is_connected or not self._client:
            await self.connect()

    async def call_tool(self, name: str, args: Dict[str, Any]) -> ToolResult:
        await self._ensure_connected()
        assert self._client is not None

        # This implementation assumes a simple RPC-style endpoint.
        # The TS SDK uses an SSE connection which may behave differently.
        tool_call_endpoint = self._mcp_url.replace("/sse", "/call_tool")

        if self._debug:
            print(f"[SecureLend SDK] Calling tool '{name}' with args: {args}")

        try:
            response = await self._client.post(
                tool_call_endpoint,
                json={"name": name, "arguments": args},
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (401, 403):
                raise AuthenticationError("Authentication failed.") from e
            if e.response.status_code >= 500:
                raise ServerError(f"Server error: {e.response.text}") from e
            raise NetworkError(f"HTTP error: {e}") from e
        except httpx.RequestError as e:
            raise NetworkError(f"Network error: {e}") from e

    def set_api_key(self, api_key: str) -> None:
        self._api_key = api_key
        self._is_connected = False
        self._client = None

    def enable_debug(self) -> None:
        self._debug = True

    def disable_debug(self) -> None:
        self._debug = False
