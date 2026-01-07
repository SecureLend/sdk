import { Client } from '@modelcontextprotocol/sdk/client/index.js';
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
      { name: '@securelend/mcp-client', version: '1.0.0' },
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

  async callTool<T>(name: string, args: Record<string, any>): Promise<T> {
    await this.connect(); // Ensure connection exists

    if (this.debug) {
      console.log(`[SecureLend SDK] Calling tool: ${name} with args:`, args);
    }

    try {
      const result = await this.mcp.callTool({ name, arguments: args });
      
      if (this.debug) {
        console.log(`[SecureLend SDK] Tool result for ${name}:`, result);
      }

      // Assuming the relevant content is in the first part and is JSON.
      // This is a big assumption and might need to be more robust.
      const content = result.content[0];
      if (content?.type === 'resource' && content.resource.mimeType === 'application/json') {
        return JSON.parse(content.resource.text);
      } else if (content?.type === 'text') {
        // Attempt to parse if it looks like JSON
        try {
          return JSON.parse(content.text);
        } catch (e) {
            // Not JSON, return as is. This might not match <T>.
            return content.text as any;
        }
      }

      throw new SecureLendError('Unexpected tool response format from MCP server', 'mcp_error', result);
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
