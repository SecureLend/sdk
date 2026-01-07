import { BaseResource } from './base';
import type {
  CreditCardComparisonRequest,
  CreditCardComparisonResponse,
} from '../types';

export class CreditCards extends BaseResource {
  async compare(
    request: CreditCardComparisonRequest
  ): Promise<CreditCardComparisonResponse> {
    this.validateCardRequest(request);
    return this.client.callTool<CreditCardComparisonResponse>(
      'find_credit_cards',
      request
    );
  }
  
  private validateCardRequest(request: CreditCardComparisonRequest): void {
    if (
      !request.creditScore ||
      request.creditScore < 300 ||
      request.creditScore > 850
    ) {
      throw new Error('Valid credit score (300-850) is required');
    }
    
    if (!request.monthlySpend || request.monthlySpend < 0) {
      throw new Error('Monthly spend must be a positive number');
    }
  }
}
