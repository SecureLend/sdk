from typing import Any, Dict, Optional

from mcp.client import Client, ToolResult
from mcp.client.transports.http import StreamableHTTPClientTransport

from ..utils.errors import ServerError


class MCPClient:
    def __init__(self, *, api_key: str, mcp_url: str):
        self._api_key = api_key
        self._mcp_url = mcp_url
        self._debug = False
        self._is_connected = False
        self._mcp: Optional[Client] = None

    async def connect(self) -> None:
        if self._is_connected and self._mcp:
            return

        if self._debug:
            print(f"[SecureLend SDK] Connecting to MCP server at {self._mcp_url}")

        self._mcp = Client(
            name=f"securelend-python/{__import__('securelend').__version__}"
        )

        headers = {
            "User-Agent": f"securelend-python/{__import__('securelend').__version__}",
        }
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"

        transport = StreamableHTTPClientTransport(
            url=self._mcp_url,
            headers=headers,
        )
        self._mcp.add_transport(transport)

        try:
            await self._mcp.connect()
            self._is_connected = True
        except Exception as e:
            self._is_connected = False
            self._mcp = None
            raise ServerError(f"Failed to connect to MCP server: {e}") from e

    async def _ensure_connected(self) -> None:
        if not self._is_connected or not self._mcp:
            await self.connect()

    async def call_tool(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        await self._ensure_connected()
        assert self._mcp is not None

        if self._debug:
            print(f"[SecureLend SDK] Calling tool '{name}' with args: {args}")

        try:
            result: ToolResult = await self._mcp.tools.call(name, **args)
            return result.model_dump(by_alias=True)
        except Exception as e:
            raise ServerError(f"MCP tool call failed: {e}") from e

    def set_api_key(self, api_key: str) -> None:
        self._api_key = api_key
        self._is_connected = False
        self._mcp = None

    def enable_debug(self) -> None:
        self._debug = True

    def disable_debug(self) -> None:
        self._debug = False
