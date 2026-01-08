import json
from typing import Generic, TypeVar, Optional

from ..utils.mcp import MCPClient
from ..types import ToolResult
from ..utils.errors import SecureLendError

T = TypeVar("T")

class BaseResource(Generic[T]):
    def __init__(self, client: MCPClient):
        self._client = client

    def _parse_json_response(self, tool_result: ToolResult) -> T:
        content_list = tool_result.get("content", [])
        if not isinstance(content_list, list):
            raise SecureLendError("Invalid response: content is not a list", "server_error")

        for item in content_list:
            item_type = item.get("type")
            if item_type == "text":
                try:
                    return json.loads(item.get("text", "{}"))
                except json.JSONDecodeError as e:
                    raise SecureLendError(f"Failed to parse JSON response: {e}", "server_error") from e
            elif item_type == "resource" and item.get("resource", {}).get("mimeType") == "application/json":
                try:
                    return json.loads(item.get("resource", {}).get("text", "{}"))
                except json.JSONDecodeError as e:
                    raise SecureLendError(f"Failed to parse JSON response: {e}", "server_error") from e

        raise SecureLendError("Invalid response from MCP server: missing JSON content", "server_error")

    def _get_widget(self, tool_result: ToolResult) -> Optional[str]:
        content_list = tool_result.get("content", [])
        if not isinstance(content_list, list):
            return None

        for item in content_list:
            if item.get("type") == "resource" and item.get("resource", {}).get("mimeType") == "text/html":
                return item.get("resource", {}).get("text")
        return None
