import { z } from "zod";
import { MCPClient } from "./utils/mcp";
import * as types from "./types";
import { SecureLendError, ValidationError } from "./utils/errors";

// Minimal interface definitions to satisfy the compiler.
// This is necessary because `@modelcontextprotocol/sdk` may not export `ToolResult` as expected.
interface ContentItem {
  type: "resource" | "text";
  resource?: {
    mimeType: string;
    text: string;
  };
  text?: string;
}
interface ToolResult {
  content: ContentItem[];
  structuredContent?: unknown;
}

/**
 * SecureLend MCP-native SDK Client
 *
 * @example
 * ```typescript
 * import { SecureLend } from '@securelend/sdk';
 *
 * const securelend = new SecureLend();
 *
 * const loans = await securelend.compareBusinessLoans({
 *   amount: 200000,
 *   purpose: 'equipment',
 *   business: {
 *     revenue: 1200000,
 *     creditScore: 720,
 *     timeInBusiness: 36
 *   }
 * });
 * ```
 */
export class SecureLend {
  private mcpClient: MCPClient;

  /** Raw access to the underlying MCP client */
  public readonly mcp: MCPClient["mcp"];

  /**
   * Create a new SecureLend client
   *
   * @param config - Optional configuration
   */
  constructor(config?: types.SecureLendConfig) {
    const mcpURL = config?.serverUrl || "https://mcp.securelend.ai/mcp";

    this.mcpClient = new MCPClient({ apiKey: "", mcpURL });
    this.mcp = this.mcpClient.mcp;
  }

  // --- Loan Comparison ---

  async comparePersonalLoans(
    request: types.PersonalLoanSearchParams,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool(
      "compare_personal_loans",
      request,
      types.loanComparisonResponseSchema,
    );
  }

  async compareBusinessLoans(
    request: types.BusinessLoanSearchParams,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool(
      "compare_business_loans",
      request,
      types.loanComparisonResponseSchema,
    );
  }

  async comparePersonalMortgages(
    request: types.MortgageSearchParams,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool(
      "compare_personal_mortgages",
      request,
      types.loanComparisonResponseSchema,
    );
  }

  async compareBusinessMortgages(
    request: types.MortgageSearchParams,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool(
      "compare_business_mortgages",
      request,
      types.loanComparisonResponseSchema,
    );
  }

  async compareCarLoans(
    request: types.AutoLoanSearchParams,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool(
      "compare_car_loans",
      request,
      types.loanComparisonResponseSchema,
    );
  }

  async compareStudentLoans(
    request: types.StudentLoanSearchParams,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool(
      "compare_student_loans",
      request,
      types.loanComparisonResponseSchema,
    );
  }

  // --- Banking & Credit Cards ---

  async compareBusinessBanking(
    request: types.BusinessBankingSearchSchema,
  ): Promise<types.BusinessBankingComparisonResponse> {
    return this.callTool(
      "compare_business_banking",
      request,
      types.businessBankingComparisonResponseSchema,
    );
  }

  async comparePersonalBanking(
    request: types.PersonalBankingSearchSchema,
  ): Promise<types.PersonalBankingComparisonResponse> {
    return this.callTool(
      "compare_personal_banking",
      request,
      types.personalBankingComparisonResponseSchema,
    );
  }

  async compareSavingsAccounts(
    request: types.SavingsSearchSchema,
  ): Promise<types.SavingsAccountComparisonResponse> {
    return this.callTool(
      "compare_savings_accounts",
      request,
      types.savingsComparisonResponseSchema,
    );
  }

  async compareBusinessCreditCards(
    request: types.BusinessCreditCardSearchParams,
  ): Promise<types.BusinessCreditCardComparisonResponse> {
    return this.callTool(
      "compare_business_credit_cards",
      request,
      types.businessCreditCardComparisonResponseSchema,
    );
  }

  async comparePersonalCreditCards(
    request: types.PersonalCreditCardSearchSchema,
  ): Promise<types.PersonalCreditCardComparisonResponse> {
    return this.callTool(
      "compare_personal_credit_cards",
      request,
      types.personalCreditCardComparisonResponseSchema,
    );
  }

  // --- Financial Calculators ---

  async calculateLoanPayment(
    request: types.LoanPaymentParams,
  ): Promise<types.LoanCalculationResponse> {
    return this.callTool(
      "calculate_loan_payment",
      request,
      types.loanPaymentResponseSchema,
    );
  }

  async calculateMortgagePayment(
    request: types.MortgagePaymentParams,
  ): Promise<types.MortgageCalculationResponse> {
    return this.callTool(
      "calculate_mortgage_payment",
      request,
      types.mortgagePaymentResponseSchema,
    );
  }

  async compareLeaseVsPurchase(
    request: types.LeaseVsPurchaseParams,
  ): Promise<types.LeaseVsPurchaseResponse> {
    return this.callTool(
      "compare_lease_vs_purchase",
      request,
      types.leaseVsPurchaseResponseSchema,
    );
  }

  // --- Application Management ---

  async getOffer(
    request: types.GetOfferParams,
  ): Promise<types.PersonalApplication> {
    return this.callTool("get_offer", request, types.personalApplicationSchema);
  }

  async getMultipleOffers(
    request: types.GetMultipleOffersParams,
  ): Promise<types.PersonalApplication> {
    return this.callTool(
      "get_multiple_offers",
      request,
      types.personalApplicationSchema,
    );
  }

  async displayOfferForm(
    request: types.DisplayOfferFormParams,
  ): Promise<types.DisplayOfferFormResponse> {
    return this.callTool(
      "display_offer_form",
      request,
      types.displayOfferFormResponseSchema,
    );
  }

  async trackOfferStatus(
    request: types.TrackOfferStatusParams,
  ): Promise<types.TrackOfferStatusResponse> {
    return this.callTool(
      "track_offer_status",
      request,
      types.trackOfferStatusResponseSchema,
    );
  }

  async displayUploadDocumentsForm(
    request: types.DisplayUploadDocumentsFormParams,
  ): Promise<types.DisplayUploadDocumentsFormResponse> {
    return this.callTool(
      "display_upload_documents_form",
      request,
      types.displayUploadDocumentsFormResponseSchema,
    );
  }

  async submitDocuments(
    request: types.SubmitDocumentsParams,
  ): Promise<types.SubmitDocumentsResponse> {
    return this.callTool(
      "submit_documents",
      request,
      types.submitDocumentsResponseSchema,
    );
  }

  // --- Core Methods ---

  /**
   * Manually connect to the MCP server.
   * Connection is otherwise established on the first tool call.
   */
  async connect(): Promise<void> {
    await this.mcpClient.connect();
  }

  /**
   * Enable debug logging
   */
  enableDebug(): void {
    this.mcpClient.enableDebug();
  }

  /**
   * Disable debug logging
   */
  disableDebug(): void {
    this.mcpClient.disableDebug();
  }

  // --- Private Helpers ---

  private async callTool<T extends { widget?: string }>(
    toolName: string,
    request: unknown,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const toolResult = await this.mcpClient.callTool(
      toolName,
      request as Record<string, unknown>,
    );
    const data = this.parseJsonResponse(toolResult as ToolResult, schema);

    return { ...data, widget: this.getWidget(toolResult as ToolResult) };
  }

  private parseJsonResponse<T>(
    toolResult: ToolResult,
    schema: z.ZodType<T>,
  ): T {
    try {
      let jsonData: unknown;

      // Prefer structuredContent if available from the underlying MCP-SDK
      if (toolResult.structuredContent) {
        jsonData = toolResult.structuredContent;
      } else {
        const jsonContent = toolResult.content.find(
          (c: ContentItem) =>
            (c.type === "resource" &&
              c.resource &&
              c.resource.mimeType === "application/json") ||
            c.type === "text",
        );

        if (!jsonContent) {
          throw new SecureLendError(
            "Invalid response from MCP server: missing JSON content",
            "mcp_error",
            toolResult,
          );
        }

        if (jsonContent.type === "text" && jsonContent.text) {
          jsonData = JSON.parse(jsonContent.text);
        } else if (jsonContent.type === "resource" && jsonContent.resource) {
          jsonData = JSON.parse(jsonContent.resource.text);
        } else {
          throw new Error("Invalid content structure");
        }
      }
      return schema.parse(jsonData);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new ValidationError(
          "Invalid response from MCP server: failed to validate JSON content",
          { validationErrors: e.issues, serverResponse: toolResult },
        );
      }
      throw new SecureLendError(
        "Invalid response from MCP server: failed to parse JSON content",
        "mcp_error",
        { originalError: e, serverResponse: toolResult },
      );
    }
  }

  private getWidget(toolResult: ToolResult): string | undefined {
    const widgetContent = toolResult.content.find(
      (c: ContentItem) =>
        c.type === "resource" && c.resource?.mimeType === "text/html",
    );
    if (widgetContent?.type === "resource" && widgetContent.resource) {
      return widgetContent.resource.text;
    }
    return undefined;
  }
}
