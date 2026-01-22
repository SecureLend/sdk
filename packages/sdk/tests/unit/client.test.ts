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

    const minimalMetadata = {
      queryId: "qid-123",
      timestamp: "2023-01-01T12:00:00Z",
    };
    const minimalLoanComparisonResponse = {
      offers: [],
      summary: { totalOffers: 0, bestRate: 0.0 },
      metadata: minimalMetadata,
    };
    const minimalOffersComparisonResponse = {
      offers: [],
      metadata: minimalMetadata,
    };
    const minimalPersonalApplication = {
      id: "app-123",
      createdAt: "2023-01-01T12:00:00Z",
      updatedAt: "2023-01-01T12:00:00Z",
      applicationType: "PERSONAL",
      productType: "INSTALLMENT_LOAN",
      status: "DRAFT",
      applicant: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      },
      applicationData: {},
      providers: [],
      email: "john.doe@example.com",
    };
    const mockResponses: Record<string, any> = {
      comparePersonalLoans: minimalLoanComparisonResponse,
      compareBusinessLoans: minimalLoanComparisonResponse,
      comparePersonalMortgages: minimalLoanComparisonResponse,
      compareBusinessMortgages: minimalLoanComparisonResponse,
      compareCarLoans: minimalLoanComparisonResponse,
      compareStudentLoans: minimalLoanComparisonResponse,
      compareBusinessBanking: minimalOffersComparisonResponse,
      comparePersonalBanking: minimalOffersComparisonResponse,
      compareSavingsAccounts: minimalOffersComparisonResponse,
      compareBusinessCreditCards: minimalOffersComparisonResponse,
      comparePersonalCreditCards: minimalOffersComparisonResponse,
      calculateLoanPayment: {
        monthlyPayment: 100.0,
        totalPayment: 1200.0,
        totalInterest: 200.0,
      },
      calculateMortgagePayment: {
        loanAmount: 200000,
        principalAndInterest: 1000,
        monthlyPropertyTax: 200,
        monthlyHomeInsurance: 100,
        totalMonthlyPayment: 1300,
      },
      compareLeaseVsPurchase: {
        purchaseAnalysis: {
          totalLoanPayment: 54000,
          totalInterestPaid: 6000,
          totalSalesTax: 3000,
          equityAfterOwnership: 15000,
          totalCostOfOwnership: 42000,
          monthlyPayment: 900,
        },
        leaseAnalysis: {
          totalLeasePayments: 24000,
          totalUpfrontCosts: 2500,
          totalCostOfLeasing: 26500,
        },
        comparison: {
          purchaseCostIsLowerBy: 0,
          leaseCostIsLowerBy: 15500,
          recommendation: "LEASE",
        },
      },
      getOffer: minimalPersonalApplication,
      getMultipleOffers: minimalPersonalApplication,
      displayOfferForm: {
        // A minimal LoanOffer
        offer: {
          offerId: "offer-123",
          lender: { id: "lender-1", name: "Test Lender", type: "BANK" },
          product: { name: "Test Loan", type: "INSTALLMENT_LOAN" },
          terms: {
            amount: { amount: 10000, currency: "USD" },
            interestRate: { type: "fixed", apr: 0.05 },
            termMonths: 12,
            payment: { amount: { amount: 856.07, currency: "USD" } },
          },
        },
        allOffers: [],
        applicationData: {},
        productType: "INSTALLMENT_LOAN",
      },
      trackOfferStatus: {
        applications: [],
      },
      displayUploadDocumentsForm: {
        widget: "<div>upload form</div>",
      },
      submitDocuments: {
        success: true,
        message: "OK",
      },
    };

    beforeEach(() => {
      client = new SecureLend();
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
        const mockApiResponse = mockResponses[methodName as string];
        const mockToolResult = {
          structuredContent: mockApiResponse,
          content: [] as any[],
        };

        // For widget-based responses, the widget HTML comes from the `content` part
        // of the tool result, which is what `getWidget()` parses.
        if (methodName === "displayUploadDocumentsForm") {
          mockToolResult.content.push({
            type: "resource",
            resource: {
              mimeType: "text/html",
              text: mockApiResponse.widget,
            },
          });
        }
        mcpClientInstance.callTool.mockResolvedValue(mockToolResult);

        // @ts-expect-error - Calling method dynamically
        const response = await client[methodName](mockRequest);

        expect(mcpClientInstance.callTool).toHaveBeenCalledWith(
          toolName,
          mockRequest,
        );
        expect(response).toMatchObject(mockApiResponse);
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
