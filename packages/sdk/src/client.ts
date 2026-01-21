import { MCPClient } from "./utils/mcp";
import { Loans } from "./resources/loans";
import { Banking } from "./resources/banking";
import { CreditCards } from "./resources/credit-cards";

/**
 * Configuration options for SecureLend client
 */
export interface SecureLendConfig {
  /** MCP Server URL (default: https://mcp.securelend.ai/mcp) */
  serverUrl?: string;
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
  public readonly mcp: MCPClient["mcp"];

  /**
   * Create a new SecureLend client
   *
   * @param config - Optional configuration
   */
  constructor(config?: SecureLendConfig) {
    const mcpURL = config?.serverUrl || "https://mcp.securelend.ai/mcp";

    this.mcpClient = new MCPClient({ apiKey: "", mcpURL });

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
