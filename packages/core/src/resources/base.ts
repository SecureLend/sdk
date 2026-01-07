import type { MCPClient } from '../utils/mcp';

/**
 * Base class for all SecureLend resource modules
 */
export abstract class BaseResource {
  protected client: MCPClient;
  
  constructor(client: MCPClient) {
    this.client = client;
  }
}
