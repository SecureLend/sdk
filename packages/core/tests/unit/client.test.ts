import { SecureLend } from '../../src/client';
import { MCPClient } from '../../src/utils/mcp';

// Mock the MCPClient to avoid actual network calls
jest.mock('../../src/utils/mcp');

const MCPClientMock = MCPClient as jest.MockedClass<typeof MCPClient>;

describe('SecureLend Client', () => {
  beforeEach(() => {
    // Clears the record of calls to the mock constructor and its methods
    MCPClientMock.mockClear();
  });

  describe('constructor', () => {
    it('should create client with valid API key', () => {
      const client = new SecureLend('sk_test_abcdef123456789012345678901234567890');
      expect(client).toBeInstanceOf(SecureLend);
      expect(client.loans).toBeDefined();
      expect(client.banking).toBeDefined();
      expect(client.creditCards).toBeDefined();
      expect(MCPClientMock).toHaveBeenCalledTimes(1);
    });

    it('should throw error with invalid API key format', () => {
      expect(() => {
        new SecureLend('invalid_key');
      }).toThrow('Invalid API key format');
    });

    it('should throw error with empty API key', () => {
      expect(() => {
        new SecureLend('');
      }).toThrow('Invalid API key format');
    });
  });

  describe('configuration', () => {
    it('should use default config when not provided', () => {
      const client = new SecureLend('sk_test_abcdef123456789012345678901234567890');
      expect(client).toBeInstanceOf(SecureLend);
      expect(MCPClientMock).toHaveBeenCalledWith({
        apiKey: 'sk_test_abcdef123456789012345678901234567890',
        mcpURL: 'https://mcp.securelend.ai/sse',
      });
    });

    it('should accept custom configuration', () => {
      const client = new SecureLend('sk_test_abcdef123456789012345678901234567890', {
        mcpURL: 'https://custom.mcp.com/sse',
      });
      expect(client).toBeInstanceOf(SecureLend);
      expect(MCPClientMock).toHaveBeenCalledWith({
        apiKey: 'sk_test_abcdef123456789012345678901234567890',
        mcpURL: 'https://custom.mcp.com/sse',
      });
    });
  });

  describe('methods', () => {
    let client: SecureLend;
    let mcpClientInstance: jest.Mocked<MCPClient>;

    beforeEach(() => {
      client = new SecureLend('sk_test_abcdef123456789012345678901234567890');
      mcpClientInstance = MCPClientMock.mock.instances[0] as jest.Mocked<MCPClient>;
    });

    it('should call mcpClient.connect when connect is called', async () => {
      await client.connect();
      expect(mcpClientInstance.connect).toHaveBeenCalledTimes(1);
    });

    it('should call mcpClient.setApiKey when setApiKey is called', () => {
      client.setApiKey('sk_test_newkey123456789012345678901234567890');
      expect(mcpClientInstance.setApiKey).toHaveBeenCalledWith('sk_test_newkey123456789012345678901234567890');
    });

    it('should call mcpClient.enableDebug when enableDebug is called', () => {
      client.enableDebug();
      expect(mcpClientInstance.enableDebug).toHaveBeenCalledTimes(1);
    });

    it('should call mcpClient.disableDebug when disableDebug is called', () => {
      client.disableDebug();
      expect(mcpClientInstance.disableDebug).toHaveBeenCalledTimes(1);
    });
  });
});
