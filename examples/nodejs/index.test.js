import { main } from './index.js';
import { SecureLend } from '@securelend/sdk';

// Mock the SDK to avoid actual network calls
jest.mock('@securelend/sdk');

describe('NodeJS Example', () => {
  let secureLendInstance;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    SecureLend.mockClear();
    secureLendInstance = {
      compareBusinessLoans: jest.fn(),
    };
    SecureLend.mockImplementation(() => secureLendInstance);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should log loan offers when API call is successful', async () => {
    const mockResponse = {
      summary: { totalOffers: 2 },
      offers: [
        {
          lender: { name: 'Test Lender 1' },
          product: { name: 'Test Loan 1' },
          terms: { interestRate: { apr: 0.05 }, termMonths: 60 },
        },
        {
          lender: { name: 'Test Lender 2' },
          product: { name: 'Test Loan 2' },
          terms: { interestRate: { apr: 0.06 }, termMonths: 48 },
        },
      ],
    };
    secureLendInstance.compareBusinessLoans.mockResolvedValue(mockResponse);

    await main();

    expect(consoleLogSpy).toHaveBeenCalledWith('Running SecureLend SDK NodeJS example...');
    expect(secureLendInstance.compareBusinessLoans).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('Found 2 loan offers.');
    expect(consoleLogSpy).toHaveBeenCalledWith('Top offer:');
    expect(consoleLogSpy).toHaveBeenCalledWith('  - Lender: Test Lender 1');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should log an error when API call fails', async () => {
    const mockError = new Error('API Failure');
    secureLendInstance.compareBusinessLoans.mockRejectedValue(mockError);

    await main();

    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred:', mockError);
    expect(consoleLogSpy).toHaveBeenCalledWith('Running SecureLend SDK NodeJS example...');
    expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('loan offers'));
  });
});
