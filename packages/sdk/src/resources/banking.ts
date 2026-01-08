import { ValidationError } from "../utils/errors";
import { BaseResource } from "./base";
import type {
  BankingComparisonRequest,
  BankingComparisonResponse,
} from "../types";

export class Banking extends BaseResource {
  async compare(
    request: BankingComparisonRequest,
  ): Promise<BankingComparisonResponse> {
    this.validateBankingRequest(request);
    const toolResult = await this.client.callTool(
      "find_banking_accounts",
      request,
    );
    const data =
      this.parseJsonResponse<Omit<BankingComparisonResponse, "widget">>(
        toolResult,
      );
    return {
      ...data,
      widget: this.getWidget(toolResult),
    };
  }

  private validateBankingRequest(request: BankingComparisonRequest): void {
    if (!request.accountType) {
      throw new ValidationError("Account type is required");
    }

    const validTypes = ["checking", "savings", "both"];
    if (!validTypes.includes(request.accountType)) {
      throw new ValidationError(
        `Invalid account type. Must be one of: ${validTypes.join(", ")}`,
      );
    }
  }
}
