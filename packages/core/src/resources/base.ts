import type { MCPClient } from "../utils/mcp";
import { ToolResult } from "@modelcontextprotocol/sdk/client/index.js";
import { SecureLendError } from "../utils/errors";

/**
 * Base class for all SecureLend resource modules
 */
export abstract class BaseResource {
  protected client: MCPClient;

  constructor(client: MCPClient) {
    this.client = client;
  }

  protected parseJsonResponse<T>(toolResult: ToolResult): T {
    const jsonContent = toolResult.content.find(
      (c) =>
        (c.type === "resource" && c.resource.mimeType === "application/json") ||
        c.type === "text",
    );

    if (!jsonContent) {
      throw new SecureLendError(
        "Invalid response from MCP server: missing JSON content",
        "mcp_error",
        toolResult,
      );
    }

    try {
      return jsonContent.type === "text"
        ? JSON.parse(jsonContent.text)
        : JSON.parse((jsonContent as any).resource.text);
    } catch (e) {
      throw new SecureLendError(
        "Invalid response from MCP server: failed to parse JSON content",
        "mcp_error",
        toolResult,
      );
    }
  }

  protected getWidget(toolResult: ToolResult): string | undefined {
    const widgetContent = toolResult.content.find(
      (c) => c.type === "resource" && c.resource.mimeType === "text/html",
    );
    return widgetContent ? (widgetContent as any).resource.text : undefined;
  }
}
