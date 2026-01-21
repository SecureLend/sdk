import { SecureLend } from "../../src/client";
import { MCPClient } from "../../src/utils/mcp";
import * as types from "../../src/types";

// Mock the MCPClient to avoid actual network calls
jest.mock("../../src/utils/mcp", () => ({
  MCPClient: jest.fn().mockImplementation(() => ({
    mcp: {},
    connect: jest.fn(),
    callTool: jest.fn(),
    enableDebug: jest.fn(),
    disableDebug: jest.fn(),
  })),
}));

const MCPClientMock = MCPClient as jest.MockedClass<typeof MCPClient>;

describe("SecureLend Client", () => {
  beforeEach(() => {
    // Clears the record of calls to the mock constructor and its methods
    MCPClientMock.mockClear();
    // Re-mock implementation for each test to clear calls between tests
    MCPClientMock.mockImplementation(() => ({
      mcp: {},
      connect: jest.fn(),
      callTool: jest.fn(),
      enableDebug: jest.fn(),
      disableDebug: jest.fn(),
    }));
  });

  describe("constructor", () => {
    it("should create client", () => {
      const client = new SecureLend();
      expect(client).toBeInstanceOf(SecureLend);
      expect(client.mcp).toBeDefined();
      expect(MCPClientMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("configuration", () => {
    it("should use default config when not provided", () => {
      const client = new SecureLend();
      expect(client).toBeInstanceOf(SecureLend);
      expect(MCPClientMock).toHaveBeenCalledWith({
        apiKey: "",
        mcpURL: "https://mcp.securelend.ai/mcp",
      });
    });

    it("should accept custom configuration", () => {
      const client = new SecureLend({
        serverUrl: "https://custom.mcp.com/mcp",
      });
      expect(client).toBeInstanceOf(SecureLend);
      expect(MCPClientMock).toHaveBeenCalledWith({
        apiKey: "",
        mcpURL: "https://custom.mcp.com/mcp",
      });
    });
  });

  describe("methods", () => {
    let client: SecureLend;
    let mcpClientInstance: jest.Mocked<MCPClient>;

    beforeEach(() => {
      client = new SecureLend();
      mcpClientInstance = MCPClientMock.mock
        .instances[0] as jest.Mocked<MCPClient>;
    });

    it("should call mcpClient.callTool with correct params for compareBusinessLoans", async () => {
      const request: types.BusinessLoanComparisonRequest = {
        loanAmount: 10000,
        purpose: "working_capital",
        annualRevenue: 50000,
      };

      const mockToolResult = {
        toolName: "compare_business_loans",
        content: [
          {
            type: "text",
            text: JSON.stringify({ offers: [] }),
          },
        ],
      };

      (mcpClientInstance.callTool as jest.Mock).mockResolvedValue(
        mockToolResult,
      );

      await client.compareBusinessLoans(request);

      expect(mcpClientInstance.callTool).toHaveBeenCalledWith(
        "compare_business_loans",
        request,
      );
    });

    it("should call mcpClient.connect when connect is called", async () => {
      await client.connect();
      expect(mcpClientInstance.connect).toHaveBeenCalledTimes(1);
    });

    it("should call mcpClient.enableDebug when enableDebug is called", () => {
      client.enableDebug();
      expect(mcpClientInstance.enableDebug).toHaveBeenCalledTimes(1);
    });

    it("should call mcpClient.disableDebug when disableDebug is called", () => {
      client.disableDebug();
      expect(mcpClientInstance.disableDebug).toHaveBeenCalledTimes(1);
    });
  });
});
