import { MCPClient } from './utils/mcp';
import { Loans } from './resources/loans';
import { Banking } from './resources/banking';
import { CreditCards } from './resources/credit-cards';

/**
 * Configuration options for SecureLend client
 */
export interface SecureLendConfig {
  /** MCP Server URL (default: https://mcp.securelend.ai/sse) */
  mcpURL?: string;
  
  /** Environment (default: production) */
  environment?: 'production' | 'development';
}

/**
 * SecureLend MCP-native SDK Client
 * 
 * @example
 * ```typescript
 * import { SecureLend } from '@securelend/sdk';
 * 
 * const securelend = new SecureLend('sk_live_...');
 * 
 * const loans = await securelend.loans.compare({
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
  
  /** Loan comparison and management */
  public readonly loans: Loans;
  
  /** Business banking comparison */
  public readonly banking: Banking;
  
  /** Credit card comparison */
  public readonly creditCards: CreditCards;
  
  /** Raw access to the underlying MCP client */
  public readonly mcp: MCPClient['mcp'];

  /**
   * Create a new SecureLend client
   * 
   * @param apiKey - Your SecureLend API key (sk_test_... or sk_live_...)
   * @param config - Optional configuration
   */
  constructor(apiKey: string, config?: SecureLendConfig) {
    if (!apiKey || !apiKey.match(/^sk_(test|live)_[a-zA-Z0-9]{32,}$/)) {
      throw new Error(
        'Invalid API key format. Expected: sk_test_... or sk_live_...'
      );
    }
    
    const mcpURL = config?.mcpURL || 'https://mcp.securelend.ai/sse';
    
    this.mcpClient = new MCPClient({ apiKey, mcpURL });
    
    // Initialize resource modules
    this.loans = new Loans(this.mcpClient);
    this.banking = new Banking(this.mcpClient);
    this.creditCards = new CreditCards(this.mcpClient);
    this.mcp = this.mcpClient.mcp;
  }
  
  /**
   * Manually connect to the MCP server.
   * Connection is otherwise established on the first tool call.
   */
  async connect(): Promise<void> {
    await this.mcpClient.connect();
  }
  
  /**
   * Update API key (useful for multi-tenant applications).
   * This will require a new connection to the MCP server.
   */
  setApiKey(apiKey: string): void {
    this.mcpClient.setApiKey(apiKey);
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
}
