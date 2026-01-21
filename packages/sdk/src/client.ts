import { MCPClient } from "./utils/mcp";
import * as types from "./types";
import { SecureLendError } from "./utils/errors";

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
    request: types.PersonalLoanComparisonRequest,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool<types.LoanComparisonResponse>(
      "compare_personal_loans",
      request,
    );
  }

  async compareBusinessLoans(
    request: types.BusinessLoanComparisonRequest,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool<types.LoanComparisonResponse>(
      "compare_business_loans",
      request,
    );
  }

  async comparePersonalMortgages(
    request: types.MortgageComparisonRequest,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool<types.LoanComparisonResponse>(
      "compare_personal_mortgages",
      request,
    );
  }

  async compareBusinessMortgages(
    request: types.MortgageComparisonRequest,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool<types.LoanComparisonResponse>(
      "compare_business_mortgages",
      request,
    );
  }

  async compareCarLoans(
    request: types.AutoLoanComparisonRequest,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool<types.LoanComparisonResponse>(
      "compare_car_loans",
      request,
    );
  }

  async compareStudentLoans(
    request: types.StudentLoanComparisonRequest,
  ): Promise<types.LoanComparisonResponse> {
    return this.callTool<types.LoanComparisonResponse>(
      "compare_student_loans",
      request,
    );
  }

  // --- Banking & Credit Cards ---

  async compareBusinessBanking(
    request: types.BusinessBankingComparisonRequest,
  ): Promise<types.BusinessBankingComparisonResponse> {
    return this.callTool<types.BusinessBankingComparisonResponse>(
      "compare_business_banking",
      request,
    );
  }

  async comparePersonalBanking(
    request: types.PersonalBankingComparisonRequest,
  ): Promise<types.PersonalBankingComparisonResponse> {
    return this.callTool<types.PersonalBankingComparisonResponse>(
      "compare_personal_banking",
      request,
    );
  }

  async compareSavingsAccounts(
    request: types.SavingsAccountComparisonRequest,
  ): Promise<types.SavingsAccountComparisonResponse> {
    return this.callTool<types.SavingsAccountComparisonResponse>(
      "compare_savings_accounts",
      request,
    );
  }

  async compareBusinessCreditCards(
    request: types.BusinessCreditCardComparisonRequest,
  ): Promise<types.BusinessCreditCardComparisonResponse> {
    return this.callTool<types.BusinessCreditCardComparisonResponse>(
      "compare_business_credit_cards",
      request,
    );
  }

  async comparePersonalCreditCards(
    request: types.PersonalCreditCardComparisonRequest,
  ): Promise<types.PersonalCreditCardComparisonResponse> {
    return this.callTool<types.PersonalCreditCardComparisonResponse>(
      "compare_personal_credit_cards",
      request,
    );
  }

  // --- Financial Calculators ---

  async calculateLoanPayment(
    request: types.LoanCalculationRequest,
  ): Promise<types.LoanCalculationResponse> {
    return this.callTool<types.LoanCalculationResponse>(
      "calculate_loan_payment",
      request,
    );
  }

  async calculateMortgagePayment(
    request: types.MortgageCalculationRequest,
  ): Promise<types.MortgageCalculationResponse> {
    return this.callTool<types.MortgageCalculationResponse>(
      "calculate_mortgage_payment",
      request,
    );
  }

  async compareLeaseVsPurchase(
    request: types.LeaseVsPurchaseRequest,
  ): Promise<types.LeaseVsPurchaseResponse> {
    return this.callTool<types.LeaseVsPurchaseResponse>(
      "compare_lease_vs_purchase",
      request,
    );
  }

  // --- Application Management ---

  async getOffer(
    request: types.GetOfferRequest,
  ): Promise<types.ApplicationResponse> {
    return this.callTool<types.ApplicationResponse>("get_offer", request);
  }

  async getMultipleOffers(
    request: types.GetMultipleOffersRequest,
  ): Promise<types.ApplicationResponse> {
    return this.callTool<types.ApplicationResponse>(
      "get_multiple_offers",
      request,
    );
  }

  async displayOfferForm(
    request: types.DisplayOfferFormRequest,
  ): Promise<types.DisplayOfferFormResponse> {
    return this.callTool<types.DisplayOfferFormResponse>(
      "display_offer_form",
      request,
    );
  }

  async trackOfferStatus(
    request: types.TrackOfferStatusRequest,
  ): Promise<types.TrackOfferStatusResponse> {
    return this.callTool<types.TrackOfferStatusResponse>(
      "track_offer_status",
      request,
    );
  }

  async displayUploadDocumentsForm(
    request: types.DisplayUploadDocumentsFormRequest,
  ): Promise<types.DisplayUploadDocumentsFormResponse> {
    return this.callTool<types.DisplayUploadDocumentsFormResponse>(
      "display_upload_documents_form",
      request,
    );
  }

  async submitDocuments(
    request: types.SubmitDocumentsRequest,
  ): Promise<types.SubmitDocumentsResponse> {
    return this.callTool<types.SubmitDocumentsResponse>(
      "submit_documents",
      request,
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
  ): Promise<T> {
    const toolResult = await this.mcpClient.callTool(
      toolName,
      request as Record<string, any>,
    );
    const data = this.parseJsonResponse<Omit<T, "widget">>(
      toolResult as ToolResult,
    );
    return { ...data, widget: this.getWidget(toolResult as ToolResult) } as T;
  }

  private parseJsonResponse<T>(toolResult: ToolResult): T {
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

    try {
      if (jsonContent.type === "text" && jsonContent.text) {
        return JSON.parse(jsonContent.text);
      } else if (jsonContent.type === "resource" && jsonContent.resource) {
        return JSON.parse(jsonContent.resource.text);
      }
      // This path should not be reachable if jsonContent is found
      throw new Error("Invalid content structure");
    } catch (e) {
      throw new SecureLendError(
        "Invalid response from MCP server: failed to parse JSON content",
        "mcp_error",
        toolResult,
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
