import { ValidationError } from "../utils/errors";
import { BaseResource } from "./base";
import type {
  LoanComparisonRequest,
  LoanComparisonResponse,
  LoanCalculation,
  LoanCalculationResult,
} from "../types";

export class Loans extends BaseResource {
  async compare(
    request: LoanComparisonRequest,
  ): Promise<LoanComparisonResponse> {
    this.validateComparisonRequest(request);
    const toolResult = await this.client.callTool(
      "find_business_loan_options",
      request,
    );
    const data =
      this.parseJsonResponse<Omit<LoanComparisonResponse, "widget">>(
        toolResult,
      );
    return {
      ...data,
      widget: this.getWidget(toolResult),
    };
  }

  async calculate(params: LoanCalculation): Promise<LoanCalculationResult> {
    const toolResult = await this.client.callTool(
      "calculate_loan_payment",
      params,
    );
    return this.parseJsonResponse<LoanCalculationResult>(toolResult);
  }

  private validateComparisonRequest(request: LoanComparisonRequest): void {
    if (!request.amount || request.amount < 5000) {
      throw new ValidationError("Loan amount must be at least $5,000");
    }

    if (!request.purpose) {
      throw new ValidationError("Loan purpose is required");
    }

    if (!request.business) {
      throw new ValidationError("Business information is required");
    }

    const { business } = request;

    if (!business.revenue || business.revenue < 0) {
      throw new ValidationError("Valid business revenue is required");
    }

    if (
      !business.creditScore ||
      business.creditScore < 300 ||
      business.creditScore > 850
    ) {
      throw new ValidationError("Credit score must be between 300 and 850");
    }
  }
}
