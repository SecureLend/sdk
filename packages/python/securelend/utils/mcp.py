from typing import Any, Dict, Optional
from contextlib import AsyncExitStack

from mcp import ClientSession
from mcp.client.transports.http import streamable_http_client
from mcp.types import CallToolResult

from ..utils.errors import ServerError


class MCPClient:
    def __init__(self, *, api_key: str, mcp_url: str):
        self._api_key = api_key
        self._mcp_url = mcp_url
        self._debug = False
        self._session: Optional[ClientSession] = None
        self._exit_stack = AsyncExitStack()

    async def connect(self) -> None:
        if self._session:
            return

        if self._debug:
            print(f"[SecureLend SDK] Connecting to MCP server at {self._mcp_url}")

        headers = {
            "User-Agent": f"securelend-python/{__import__('securelend').__version__}",
        }
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"

        try:
            read, write = await self._exit_stack.enter_async_context(
                streamable_http_client(url=self._mcp_url, headers=headers)
            )
            self._session = await self._exit_stack.enter_async_context(ClientSession(read, write))
            await self._session.initialize()
        except Exception as e:
            await self.close()
            raise ServerError(f"Failed to connect to MCP server: {e}") from e

    async def _ensure_connected(self) -> None:
        if not self._session:
            await self.connect()

    async def call_tool(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        await self._ensure_connected()
        assert self._session is not None

        if self._debug:
            print(f"[SecureLend SDK] Calling tool '{name}' with args: {args}")

        try:
            result: CallToolResult = await self._session.call_tool(name, args)
            return result.model_dump(by_alias=True)
        except Exception as e:
            raise ServerError(f"MCP tool call failed: {e}") from e

    async def close(self):
        await self._exit_stack.aclose()
        self._session = None
        self._exit_stack = AsyncExitStack()

    def set_api_key(self, api_key: str) -> None:
        self._api_key = api_key
        # Force re-connection on next call.
        if self._session:
            self._session = None # This will trigger reconnect on next call

    def enable_debug(self) -> None:
        self._debug = True

    def disable_debug(self) -> None:
        self._debug = False
