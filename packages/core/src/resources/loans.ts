import { BaseResource } from './base';
import type {
  LoanComparisonRequest,
  LoanComparisonResponse,
  LoanCalculation,
  LoanCalculationResult,
} from '../types';

export class Loans extends BaseResource {
  async compare(
    request: LoanComparisonRequest
  ): Promise<LoanComparisonResponse> {
    this.validateComparisonRequest(request);
    return this.client.callTool<LoanComparisonResponse>('find_business_loan_options', request);
  }
  
  async calculate(params: LoanCalculation): Promise<LoanCalculationResult> {
    return this.client.callTool<LoanCalculationResult>('calculate_loan_payment', params);
  }
  
  private validateComparisonRequest(request: LoanComparisonRequest): void {
    if (!request.amount || request.amount < 5000) {
      throw new Error('Loan amount must be at least $5,000');
    }
    
    if (!request.purpose) {
      throw new Error('Loan purpose is required');
    }
    
    if (!request.business) {
      throw new Error('Business information is required');
    }
    
    const { business } = request;
    
    if (!business.revenue || business.revenue < 0) {
      throw new Error('Valid business revenue is required');
    }
    
    if (
      !business.creditScore ||
      business.creditScore < 300 ||
      business.creditScore > 850
    ) {
      throw new Error('Credit score must be between 300 and 850');
    }
  }
}
