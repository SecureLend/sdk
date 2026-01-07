import { Client, ToolResult } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { SecureLendError, AuthenticationError, NetworkError, ValidationError } from './errors';

interface MCPClientConfig {
  apiKey: string;
  mcpURL: string;
}

export class MCPClient {
  public mcp: Client;
  private config: MCPClientConfig;
  private debug: boolean = false;
  private isConnected: boolean = false;

  constructor(config: MCPClientConfig) {
    this.config = config;
    
    this.mcp = new Client(
      { name: '@securelend/sdk', version: '1.0.0' },
      { capabilities: { tools: {}, widgets: { supportsHtml: true } } }
    );
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      if (this.debug) {
        console.log(`[SecureLend SDK] Connecting to MCP server at ${this.config.mcpURL}`);
      }
      const transport = new SSEClientTransport({
        url: this.config.mcpURL,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });
      await this.mcp.connect(transport);
      this.isConnected = true;
      if (this.debug) {
        console.log(`[SecureLend SDK] MCP client connected.`);
      }
    } catch (error: any) {
      this.isConnected = false;
      // Poor man's error mapping. The MCP SDK should have better error types.
      if (error.message?.includes('401')) {
        throw new AuthenticationError('MCP connection failed: Invalid API key.');
      }
      throw new NetworkError(`MCP connection failed: ${error.message}`);
    }
  }

  async callTool(name: string, args: Record<string, any>): Promise<ToolResult> {
    await this.connect(); // Ensure connection exists

    if (this.debug) {
      console.log(`[SecureLend SDK] Calling tool: ${name} with args:`, args);
    }

    try {
      const result = await this.mcp.callTool({ name, arguments: args });
      
      if (this.debug) {
        console.log(`[SecureLend SDK] Tool result for ${name}:`, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof SecureLendError) throw error;
      // Again, poor man's error mapping
      if (error.message?.includes('400')) {
        throw new ValidationError('Invalid tool arguments', error.details);
      }
      throw new SecureLendError(`Tool call failed: ${error.message}`, 'mcp_tool_error', error);
    }
  }

  setApiKey(apiKey: string): void {
    // MCP client doesn't support hot-swapping API key after connection.
    // This would require a disconnect/reconnect cycle.
    // For now, we'll just update the config for the *next* connection.
    this.config.apiKey = apiKey;
    this.isConnected = false; // Force reconnect on next call
  }

  enableDebug(): void {
    this.debug = true;
  }

  disableDebug(): void {
    this.debug = false;
  }
}
