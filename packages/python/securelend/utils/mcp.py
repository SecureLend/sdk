from contextlib import AsyncExitStack
from typing import Any, Dict, Optional

import httpx
from mcp import ClientSession, McpError
from mcp.client.streamable_http import streamablehttp_client

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
        self._session: Optional[ClientSession] = None
        self._exit_stack = AsyncExitStack()
        self._reconnect_required = False

    async def _get_session(self) -> ClientSession:
        if self._session is None or self._reconnect_required:
            await self.connect()
            self._reconnect_required = False
        assert self._session is not None
        return self._session

    async def connect(self) -> None:
        if self._session:
            await self.close()

        self._exit_stack = AsyncExitStack()
        headers = {
            "User-Agent": f"securelend-python/{__import__('securelend').__version__}",
        }
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"

        if self._debug:
            print(f"[SecureLend SDK] Connecting to MCP server at {self._mcp_url}")

        try:
            transport_context = streamablehttp_client(
                url=self._mcp_url, headers=headers
            )
            read_stream, write_stream = await self._exit_stack.enter_async_context(
                transport_context
            )
            session_context = ClientSession(read_stream, write_stream)
            self._session = await self._exit_stack.enter_async_context(session_context)
            await self._session.initialize()
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (401, 403):
                raise AuthenticationError("Authentication failed.") from e
            if e.response.status_code == 429:
                retry_after_header = e.response.headers.get("Retry-After")
                retry_after = None
                if retry_after_header and retry_after_header.isdigit():
                    retry_after = int(retry_after_header)
                raise RateLimitError(
                    "Rate limit exceeded.", retry_after=retry_after
                ) from e
            if e.response.status_code >= 500:
                raise ServerError(f"Server error: {e.response.text}") from e
            raise NetworkError(f"HTTP error: {e}") from e
        except httpx.RequestError as e:
            raise NetworkError(f"Network error: {e}") from e
        except Exception as e:
            raise NetworkError(f"Failed to connect to MCP server: {e}") from e

    async def call_tool(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        session = await self._get_session()
        try:
            if self._debug:
                print(f"[SecureLend SDK] Calling tool '{name}' with args: {args}")

            result = await session.call_tool(name, args)

            content_list = []
            for item in result.content:
                content_item = {"type": item.type, "text": item.text}
                if item.resource:
                    content_item["resource"] = {
                        "mimeType": item.resource.mimeType,
                        "text": item.resource.text,
                    }
                content_list.append(content_item)

            return {
                "content": content_list,
                "structuredContent": result.structuredContent,
                "requestId": result.requestId,
            }
        except McpError as e:
            raise ServerError(f"MCP tool call failed: {e.message}") from e

    async def close(self):
        if self._session:
            await self._exit_stack.aclose()
        self._session = None
        self._exit_stack = AsyncExitStack()

    def set_api_key(self, api_key: str) -> None:
        self._api_key = api_key
        self._reconnect_required = True

    def enable_debug(self) -> None:
        self._debug = True

    def disable_debug(self) -> None:
        self._debug = False
