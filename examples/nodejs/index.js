import { SecureLend } from '@securelend/sdk';
import { fileURLToPath } from 'url';

export async function main() {
  console.log('Running SecureLend SDK NodeJS example...');

  // Create a new client. The API key is optional but recommended for production.
  const securelend = new SecureLend({
    apiKey: process.env.SECURELEND_API_KEY,
  });

  try {
    const response = await securelend.compareBusinessLoans({
      loanAmount: 50000,
      purpose: 'working_capital',
      annualRevenue: 300000,
      industry: 'restaurant',
      state: 'CA',
    });

    console.log(`Found ${response.summary.totalOffers} loan offers.`);

    if (response.offers.length > 0) {
      console.log('Top offer:');
      const topOffer = response.offers[0];
      console.log(`  - Lender: ${topOffer.lender.name}`);
      console.log(`  - Product: ${topOffer.product.name}`);
      console.log(`  - APR: ${(topOffer.terms.interestRate.apr * 100).toFixed(2)}%`);
      console.log(`  - Term: ${topOffer.terms.termMonths} months`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run main if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
