import { SecureLend } from '@securelend/sdk';

async function main() {
  console.log('Running SecureLend SDK NodeJS example...');

  const securelend = new SecureLend();

  try {
    const response = await securelend.compareBusinessLoans({
      loanAmount: 50000,
      purpose: 'working_capital',
      annualRevenue: 250000,
      creditScore: 700,
      industry: 'Technology',
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

main();
