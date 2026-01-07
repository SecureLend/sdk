import { SecureLendMCP } from '../../../src/client';
import { MCPClient } from '../../../src/utils/mcp';
import { CreditCardComparisonRequest } from '../../../src/types';

jest.mock('../../../src/utils/mcp');
const MCPClientMock = MCPClient as jest.MockedClass<typeof MCPClient>;

describe('CreditCards Resource', () => {
  let securelend: SecureLendMCP;
  let mcpClientInstance: jest.Mocked<MCPClient>;

  beforeEach(() => {
    MCPClientMock.mockClear();
    securelend = new SecureLendMCP('sk_test_abcdef123456789012345678901234567890');
    mcpClientInstance = MCPClientMock.mock.instances[0] as jest.Mocked<MCPClient>;
  });

  describe('compare', () => {
    it('should call the correct MCP tool with valid arguments', async () => {
      const request: CreditCardComparisonRequest = {
        creditScore: 750,
        monthlySpend: 5000,
      };
      await securelend.creditCards.compare(request);
      expect(mcpClientInstance.callTool).toHaveBeenCalledWith('find_credit_cards', request);
    });

    it('should throw an error if credit score is invalid', async () => {
        const request: CreditCardComparisonRequest = {
            creditScore: 100,
            monthlySpend: 5000,
        };
        await expect(securelend.creditCards.compare(request)).rejects.toThrow('Valid credit score (300-850) is required');
    });

    it('should throw an error if monthly spend is invalid', async () => {
        const request: CreditCardComparisonRequest = {
            creditScore: 750,
            monthlySpend: -100,
        };
        await expect(securelend.creditCards.compare(request)).rejects.toThrow('Monthly spend must be a positive number');
    });
  });
});
