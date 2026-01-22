import { SecureLend } from "../../src/client";
import { MCPClient } from "../../src/utils/mcp";
import * as types from "../../src/types";

// Mock the MCPClient to avoid actual network calls
jest.mock("../../src/utils/mcp");

const MCPClientMock = MCPClient as any;

describe("SecureLend Client", () => {
  let mcpClientInstance: {
    mcp: object;
    connect: jest.Mock;
    callTool: jest.Mock;
    enableDebug: jest.Mock;
    disableDebug: jest.Mock;
  };

  beforeEach(() => {
    MCPClientMock.mockClear();
    mcpClientInstance = {
      mcp: {},
      connect: jest.fn(),
      callTool: jest.fn(),
      enableDebug: jest.fn(),
      disableDebug: jest.fn(),
    };
    MCPClientMock.mockImplementation(() => mcpClientInstance);
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
      new SecureLend();
      expect(MCPClientMock).toHaveBeenCalledWith({
        apiKey: "",
        mcpURL: "https://mcp.securelend.ai/mcp",
      });
    });

    it("should accept custom configuration", () => {
      new SecureLend({
        serverUrl: "https://custom.mcp.com/mcp",
      });
      expect(MCPClientMock).toHaveBeenCalledWith({
        apiKey: "",
        mcpURL: "https://custom.mcp.com/mcp",
      });
    });
  });

  describe("methods", () => {
    let client: SecureLend;

    beforeEach(() => {
      client = new SecureLend();
    });

    it("should call mcpClient.callTool with correct params for compareBusinessLoans", async () => {
      const request: types.BusinessLoanSearchParams = {
        loanAmount: 10000,
        purpose: "working_capital",
        annualRevenue: 50000,
      };

      const mockApiResponse = {
        offers: [],
        summary: {
          totalOffers: 0,
          bestRate: 0,
        },
        metadata: {
          queryId: "d1a2f6e3-4c5b-4a9b-8f3c-1d3e2f5a6b7c",
          timestamp: new Date().toISOString(),
        },
      };

      const mockToolResult = {
        toolName: "compare_business_loans",
        content: [
          {
            type: "text",
            text: JSON.stringify(mockApiResponse),
          },
        ],
      };

      mcpClientInstance.callTool.mockResolvedValue(mockToolResult);

      const response = await client.compareBusinessLoans(request);

      expect(mcpClientInstance.callTool).toHaveBeenCalledWith(
        "compare_business_loans",
        request,
      );
      expect(response.summary.totalOffers).toBe(0);
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
