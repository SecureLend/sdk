import { MCPClient } from "../../src/utils/mcp";
import {
  AuthenticationError,
  NetworkError,
  SecureLendError,
  ValidationError,
} from "../../src/utils/errors";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Mock the underlying MCP SDK
jest.mock("@modelcontextprotocol/sdk/client/index.js");
jest.mock("@modelcontextprotocol/sdk/client/streamableHttp.js");

const MockMCP = Client as jest.Mock;
const MockTransport = StreamableHTTPClientTransport as jest.Mock;

describe("MCPClient", () => {
  let mockMcpInstance: {
    connect: jest.Mock;
    callTool: jest.Mock;
  };

  beforeEach(() => {
    mockMcpInstance = {
      connect: jest.fn(),
      callTool: jest.fn(),
    };
    MockMCP.mockImplementation(() => mockMcpInstance);
    MockTransport.mockClear();
  });

  it("should construct with correct config", () => {
    new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
    expect(MockMCP).toHaveBeenCalledWith({
      name: "@securelend/sdk",
      version: "1.0.0",
    });
  });

  describe("connect", () => {
    it("should connect successfully", async () => {
      const client = new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
      await client.connect();
      expect(MockTransport).toHaveBeenCalledWith(new URL("http://localhost"));
      expect(mockMcpInstance.connect).toHaveBeenCalled();
    });

    it("should not reconnect if already connected", async () => {
      const client = new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
      await client.connect();
      await client.connect(); // Second call
      expect(mockMcpInstance.connect).toHaveBeenCalledTimes(1);
    });

    it("should handle authentication errors (401)", async () => {
      mockMcpInstance.connect.mockRejectedValue(new Error("401 Unauthorized"));
      const client = new MCPClient({ apiKey: "invalid", mcpURL: "http://localhost" });
      await expect(client.connect()).rejects.toThrow(AuthenticationError);
    });

    it("should handle other network errors", async () => {
      mockMcpInstance.connect.mockRejectedValue(new Error("Connection refused"));
      const client = new MCPClient({ apiKey: "", mcpURL: "http://localhost" });
      await expect(client.connect()).rejects.toThrow(NetworkError);
    });

    it("should handle non-Error connection failures", async () => {
      mockMcpInstance.connect.mockRejectedValue("a string error");
      const client = new MCPClient({ apiKey: "", mcpURL: "http://localhost" });
      await expect(client.connect()).rejects.toThrow(
        "MCP connection failed: a string error",
      );
    });
  });

  describe("callTool", () => {
    it("should connect before calling a tool", async () => {
      const client = new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
      mockMcpInstance.callTool.mockResolvedValue({});
      await client.callTool("test", {});
      expect(mockMcpInstance.connect).toHaveBeenCalledTimes(1);
    });

    it("should call the underlying tool method", async () => {
      const client = new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
      await client.callTool("test", { arg1: "val1" });
      expect(mockMcpInstance.callTool).toHaveBeenCalledWith({
        name: "test",
        arguments: { arg1: "val1" },
      });
    });

    it("should handle validation errors (400)", async () => {
      mockMcpInstance.callTool.mockRejectedValue(new Error("400 Bad Request"));
      const client = new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
      await expect(client.callTool("test", {})).rejects.toThrow(ValidationError);
    });

    it("should handle other tool call errors", async () => {
      mockMcpInstance.callTool.mockRejectedValue(new Error("Internal error"));
      const client = new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
      await expect(client.callTool("test", {})).rejects.toThrow(SecureLendError);
    });

    it("should not wrap existing SecureLendError", async () => {
      const originalError = new SecureLendError("Original", "custom");
      mockMcpInstance.callTool.mockRejectedValue(originalError);
      const client = new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
      await expect(client.callTool("test", {})).rejects.toThrow(originalError);
    });

    it("should handle non-Error tool call failures", async () => {
      mockMcpInstance.callTool.mockRejectedValue("a string error");
      const client = new MCPClient({ apiKey: "test-key", mcpURL: "http://localhost" });
      await expect(client.callTool("test", {})).rejects.toThrow(
        "Tool call failed: a string error",
      );
    });
  });

  describe("setApiKey", () => {
    it("should update config and force reconnect", async () => {
      const client = new MCPClient({ apiKey: "key1", mcpURL: "http://localhost" });
      await client.connect();
      expect(mockMcpInstance.connect).toHaveBeenCalledTimes(1);

      client.setApiKey("key2");
      // Calling a tool should trigger a reconnect
      await client.callTool("test", {});
      expect(mockMcpInstance.connect).toHaveBeenCalledTimes(2);
    });
  });

  describe("debug mode", () => {
    it("should enable and disable debug logs", async () => {
      const client = new MCPClient({ apiKey: "key1", mcpURL: "http://localhost" });
      const consoleLogSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      client.enableDebug();
      // @ts-expect-error - accessing private property
      expect(client.debug).toBe(true);

      // Trigger a log
      await client.connect();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[SecureLend SDK] Connecting to MCP server at http://localhost",
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[SecureLend SDK] MCP client connected.",
      );

      client.disableDebug();
      // @ts-expect-error - accessing private property
      expect(client.debug).toBe(false);

      consoleLogSpy.mockRestore();
    });

    it("should log tool calls in debug mode", async () => {
      const client = new MCPClient({
        apiKey: "key1",
        mcpURL: "http://localhost",
      });
      const consoleLogSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      client.enableDebug();
      mockMcpInstance.callTool.mockResolvedValue({ success: true });
      await client.callTool("test_tool", { arg: 1 });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[SecureLend SDK] Calling tool: test_tool with args:",
        { arg: 1 },
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[SecureLend SDK] Tool result for test_tool:",
        { success: true },
      );

      consoleLogSpy.mockRestore();
    });
  });
});
