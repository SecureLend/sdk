import { BaseResource } from './base';
import type {
  BankingComparisonRequest,
  BankingComparisonResponse,
} from '../types';

export class Banking extends BaseResource {
  async compare(
    request: BankingComparisonRequest
  ): Promise<BankingComparisonResponse> {
    this.validateBankingRequest(request);
    return this.client.callTool<BankingComparisonResponse>('find_banking_accounts', request);
  }
  
  private validateBankingRequest(request: BankingComparisonRequest): void {
    if (!request.accountType) {
      throw new Error('Account type is required');
    }
    
    const validTypes = ['checking', 'savings', 'both'];
    if (!validTypes.includes(request.accountType)) {
      throw new Error(
        `Invalid account type. Must be one of: ${validTypes.join(', ')}`
      );
    }
  }
}
