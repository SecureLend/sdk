import { ValidationError } from "../utils/errors";
import { BaseResource } from "./base";
import type {
  CreditCardComparisonRequest,
  CreditCardComparisonResponse,
} from "../types";

export class CreditCards extends BaseResource {
  async compare(
    request: CreditCardComparisonRequest,
  ): Promise<CreditCardComparisonResponse> {
    this.validateCardRequest(request);
    const toolResult = await this.client.callTool("find_credit_cards", request);
    const data =
      this.parseJsonResponse<Omit<CreditCardComparisonResponse, "widget">>(
        toolResult,
      );
    return {
      ...data,
      widget: this.getWidget(toolResult),
    };
  }

  private validateCardRequest(request: CreditCardComparisonRequest): void {
    if (
      !request.creditScore ||
      request.creditScore < 300 ||
      request.creditScore > 850
    ) {
      throw new ValidationError("Valid credit score (300-850) is required");
    }

    if (!request.monthlySpend || request.monthlySpend < 0) {
      throw new ValidationError("Monthly spend must be a positive number");
    }
  }
}
