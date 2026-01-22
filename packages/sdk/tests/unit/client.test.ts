import { z } from "zod";
import { SecureLend } from "../../src/client";
import { MCPClient } from "../../src/utils/mcp";

// Mock the MCPClient to avoid actual network calls
jest.mock("../../src/utils/mcp");

const MCPClientMock = MCPClient as jest.Mock;
const anyObjectSchema = z.object({}).passthrough();

describe("SecureLend Client", () => {
  let mcpClientInstance: {
    mcp: object;
    connect: jest.Mock;
    callTool: jest.Mock;
    enableDebug: jest.Mock;
    disableDebug: jest.Mock;
    setApiKey: jest.Mock;
  };

  beforeEach(() => {
    MCPClientMock.mockClear();
    mcpClientInstance = {
      mcp: {},
      connect: jest.fn(),
      callTool: jest.fn(),
      enableDebug: jest.fn(),
      disableDebug: jest.fn(),
      setApiKey: jest.fn(),
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

    it("should handle relative serverUrl in browser environment", () => {
      // Mock window object
      Object.defineProperty(global, "window", {
        value: { location: { origin: "https://example.com" } },
        writable: true,
      });

      new SecureLend({ serverUrl: "/api/mcp" });
      expect(MCPClientMock).toHaveBeenCalledWith({
        apiKey: "",
        mcpURL: "https://example.com/api/mcp",
      });

      // Cleanup
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });
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
        apiKey: "sk_test_123",
        serverUrl: "https://custom.mcp.com/mcp",
      });
      expect(MCPClientMock).toHaveBeenCalledWith({
        apiKey: "sk_test_123",
        mcpURL: "https://custom.mcp.com/mcp",
      });
    });
  });

  describe("methods", () => {
    let client: SecureLend;

    beforeEach(() => {
      client = new SecureLend();
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

    it("should call mcpClient.setApiKey when setApiKey is called", () => {
      client.setApiKey("new-key");
      expect(mcpClientInstance.setApiKey).toHaveBeenCalledWith("new-key");
    });
  });

  describe("tool methods", () => {
    let client: SecureLend;
    const mockRequest = { mock: "request" };
    // A minimal, valid response for any schema that expects an object
    const mockApiResponse = {};
    const mockToolResult = {
      structuredContent: mockApiResponse,
      content: [],
    };

    beforeEach(() => {
      client = new SecureLend();
      mcpClientInstance.callTool.mockResolvedValue(mockToolResult);
    });

    const toolMethods: Array<[keyof SecureLend, string]> = [
      ["comparePersonalLoans", "compare_personal_loans"],
      ["compareBusinessLoans", "compare_business_loans"],
      ["comparePersonalMortgages", "compare_personal_mortgages"],
      ["compareBusinessMortgages", "compare_business_mortgages"],
      ["compareCarLoans", "compare_car_loans"],
      ["compareStudentLoans", "compare_student_loans"],
      ["compareBusinessBanking", "compare_business_banking"],
      ["comparePersonalBanking", "compare_personal_banking"],
      ["compareSavingsAccounts", "compare_savings_accounts"],
      ["compareBusinessCreditCards", "compare_business_credit_cards"],
      ["comparePersonalCreditCards", "compare_personal_credit_cards"],
      ["calculateLoanPayment", "calculate_loan_payment"],
      ["calculateMortgagePayment", "calculate_mortgage_payment"],
      ["compareLeaseVsPurchase", "compare_lease_vs_purchase"],
      ["getOffer", "get_offer"],
      ["getMultipleOffers", "get_multiple_offers"],
      ["displayOfferForm", "display_offer_form"],
      ["trackOfferStatus", "track_offer_status"],
      ["displayUploadDocumentsForm", "display_upload_documents_form"],
      ["submitDocuments", "submit_documents"],
    ];

    test.each(toolMethods)(
      "should call %s correctly",
      async (methodName, toolName) => {
        // This test is simplified to just check the correct tool name is called.
        // It relies on mock API response being a generic object.
        // @ts-expect-error - Calling method dynamically
        await client[methodName](mockRequest);

        expect(mcpClientInstance.callTool).toHaveBeenCalledWith(
          toolName,
          mockRequest,
        );
      },
    );
  });

  describe("private helpers", () => {
    let client: any; // Use `any` to access private methods

    beforeEach(() => {
      client = new SecureLend();
    });

    it("parseJsonResponse should use structuredContent when available", () => {
      const mockData = { a: 1 };
      const toolResult = { structuredContent: mockData, content: [] };
      const result = client.parseJsonResponse(toolResult, anyObjectSchema);
      expect(result).toEqual(mockData);
    });

    it("parseJsonResponse should fall back to text content", () => {
      const mockData = { b: 2 };
      const toolResult = {
        content: [{ type: "text", text: JSON.stringify(mockData) }],
      };
      const result = client.parseJsonResponse(toolResult, anyObjectSchema);
      expect(result).toEqual(mockData);
    });

    it("parseJsonResponse should fall back to resource content", () => {
      const mockData = { c: 3 };
      const toolResult = {
        content: [
          {
            type: "resource",
            resource: {
              mimeType: "application/json",
              text: JSON.stringify(mockData),
            },
          },
        ],
      };
      const result = client.parseJsonResponse(toolResult, anyObjectSchema);
      expect(result).toEqual(mockData);
    });

    it("parseJsonResponse should throw if JSON content is missing", () => {
      const toolResult = { content: [] };
      expect(() => client.parseJsonResponse(toolResult, anyObjectSchema)).toThrow(
        "Invalid response from MCP server: failed to parse JSON content",
      );
    });

    it("parseJsonResponse should throw on invalid content structure", () => {
      const toolResult = {
        content: [{ type: "text" }],
      };
      expect(() => client.parseJsonResponse(toolResult, anyObjectSchema)).toThrow(
        "Invalid response from MCP server: failed to parse JSON content",
      );
    });

    it("parseJsonResponse should throw on JSON parsing error", () => {
      const toolResult = {
        content: [{ type: "text", text: "not json" }],
      };
      expect(() => client.parseJsonResponse(toolResult, anyObjectSchema)).toThrow(
        "Invalid response from MCP server: failed to parse JSON content",
      );
    });

    it("parseJsonResponse should throw on Zod validation error", () => {
      const toolResult = {
        structuredContent: { unexpected: "field" },
      };
      // Use a schema that will definitely fail
      const schema = z.object({ requiredField: z.string() });
      expect(() => client.parseJsonResponse(toolResult, schema)).toThrow(
        "Invalid response from MCP server: failed to validate JSON content",
      );
    });

    it("getWidget should return HTML content when available", () => {
      const html = "<h1>Widget</h1>";
      const toolResult = {
        content: [
          { type: "resource", resource: { mimeType: "text/html", text: html } },
        ],
      };
      const result = client.getWidget(toolResult);
      expect(result).toBe(html);
    });

    it("getWidget should return undefined when no HTML content is available", () => {
      const toolResult = {
        content: [{ type: "text", text: "hello" }],
      };
      const result = client.getWidget(toolResult);
      expect(result).toBeUndefined();
    });
  });
});
