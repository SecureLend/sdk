import { SecureLend } from '../../../src/client';
import { MCPClient } from '../../../src/utils/mcp';
import { LoanComparisonRequest, LoanCalculation } from '../../../src/types';

jest.mock('../../../src/utils/mcp');
const MCPClientMock = MCPClient as jest.MockedClass<typeof MCPClient>;

describe('Loans Resource', () => {
  let securelend: SecureLend;
  let mcpClientInstance: jest.Mocked<MCPClient>;

  beforeEach(() => {
    MCPClientMock.mockClear();
    securelend = new SecureLend('sk_test_abcdef123456789012345678901234567890');
    mcpClientInstance = MCPClientMock.mock.instances[0] as jest.Mocked<MCPClient>;
  });

  describe('compare', () => {
    it('should call the correct MCP tool with valid arguments', async () => {
      const request: LoanComparisonRequest = {
        amount: 100000,
        purpose: 'working_capital',
        business: {
          revenue: 500000,
          creditScore: 700,
          timeInBusiness: 24,
        },
      };
      (mcpClientInstance.callTool as jest.Mock).mockResolvedValue({ content: [{ type: 'text', text: JSON.stringify({ offers: [] }) }] });
      await securelend.loans.compare(request);
      expect(mcpClientInstance.callTool).toHaveBeenCalledWith('find_business_loan_options', request);
    });

    it('should throw an error if amount is too low', async () => {
      const request: LoanComparisonRequest = {
        amount: 4000,
        purpose: 'working_capital',
        business: { revenue: 500000, creditScore: 700, timeInBusiness: 24 },
      };
      await expect(securelend.loans.compare(request)).rejects.toThrow('Loan amount must be at least $5,000');
    });

    it('should throw an error if credit score is invalid', async () => {
        const request: LoanComparisonRequest = {
            amount: 10000,
            purpose: 'working_capital',
            business: { revenue: 500000, creditScore: 200, timeInBusiness: 24 },
          };
        await expect(securelend.loans.compare(request)).rejects.toThrow('Credit score must be between 300 and 850');
    });

    it('should correctly parse a response with a widget', async () => {
      const request: LoanComparisonRequest = {
        amount: 100000,
        purpose: 'working_capital',
        business: { revenue: 500000, creditScore: 700, timeInBusiness: 24 },
      };
      const mockHtmlWidget = '<h1>Test Widget</h1>';
      (mcpClientInstance.callTool as jest.Mock).mockResolvedValue({ 
        content: [
          { type: 'text', text: JSON.stringify({ offers: [] }) },
          { type: 'resource', resource: { mimeType: 'text/html', text: mockHtmlWidget } }
        ] 
      });

      const result = await securelend.loans.compare(request);
      expect(result.widget).toBe(mockHtmlWidget);
      expect(result.offers).toEqual([]);
    });
  });

  describe('calculate', () => {
    it('should call the correct MCP tool with valid arguments', async () => {
      const params: LoanCalculation = {
        amount: 200000,
        rate: 5.5,
        termMonths: 60,
      };
      (mcpClientInstance.callTool as jest.Mock).mockResolvedValue({ content: [{ type: 'text', text: JSON.stringify({ monthlyPayment: 1000 }) }] });
      await securelend.loans.calculate(params);
      expect(mcpClientInstance.callTool).toHaveBeenCalledWith('calculate_loan_payment', params);
    });
  });
});
