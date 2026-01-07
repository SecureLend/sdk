import { SecureLendMCP } from '../../../src/client';
import { MCPClient } from '../../../src/utils/mcp';
import { BankingComparisonRequest } from '../../../src/types';

jest.mock('../../../src/utils/mcp');
const MCPClientMock = MCPClient as jest.MockedClass<typeof MCPClient>;

describe('Banking Resource', () => {
  let securelend: SecureLendMCP;
  let mcpClientInstance: jest.Mocked<MCPClient>;

  beforeEach(() => {
    MCPClientMock.mockClear();
    securelend = new SecureLendMCP('sk_test_abcdef123456789012345678901234567890');
    mcpClientInstance = MCPClientMock.mock.instances[0] as jest.Mocked<MCPClient>;
  });

  describe('compare', () => {
    it('should call the correct MCP tool with valid arguments', async () => {
      const request: BankingComparisonRequest = {
        accountType: 'checking',
        monthlyRevenue: 50000,
      };
      await securelend.banking.compare(request);
      expect(mcpClientInstance.callTool).toHaveBeenCalledWith('find_banking_accounts', request);
    });

    it('should throw an error if account type is missing', async () => {
      const request = { monthlyRevenue: 50000 } as BankingComparisonRequest;
      await expect(securelend.banking.compare(request)).rejects.toThrow('Account type is required');
    });
    
    it('should throw an error if account type is invalid', async () => {
        const request = { accountType: 'invalid' } as any;
        await expect(securelend.banking.compare(request)).rejects.toThrow('Invalid account type');
    });
  });
});
