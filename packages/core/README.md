# @securelend/sdk

Official SecureLend SDK for JavaScript and TypeScript.

## Installation
```bash
npm install @securelend/sdk
```

## Quick Start
```typescript
import { SecureLend } from '@securelend/sdk';

const securelend = new SecureLend('sk_test_...');

// Compare business loans
const loans = await securelend.loans.compare({
  amount: 200000,
  purpose: 'equipment',
  business: {
    revenue: 1200000,
    creditScore: 720,
    timeInBusiness: 36,
  },
});

console.log(`Found ${loans.summary.totalOffers} offers`);
console.log(`Best rate: ${loans.offers[0].terms.interestRate.rate}%`);

// Compare business banking
const banking = await securelend.banking.compare({
  accountType: 'checking',
  monthlyRevenue: 100000,
  monthlyTransactions: 500,
});

// Compare business credit cards
const cards = await securelend.creditCards.compare({
  creditScore: 720,
  monthlySpend: 15000,
});
```

## Documentation

- [Full Documentation](https://docs.securelend.ai)
- [API Reference](https://docs.securelend.ai/api)
- [Guides](https://docs.securelend.ai/guides)

## Features

- ✅ **AI Native** - Built on the Model Context Protocol for seamless integration with AI applications.
- ✅ **Business Loans** - Compare term loans, SBA loans, lines of credit
- ✅ **Business Banking** - Compare checking, savings, money market accounts
- ✅ **Business Credit Cards** - Compare rewards, cashback, and travel cards
- ✅ **Insurance** (coming soon) - Compare business insurance policies
- ✅ **TypeScript** - Full type safety with TypeScript definitions
- ✅ **React Hooks** - Available in `@securelend/react`
- ✅ **Error Handling** - Comprehensive error types
- ✅ **Widgets** - Supports interactive UI widgets from the MCP server.

## Usage

### Initialize Client
```typescript
import { SecureLend } from '@securelend/sdk';

const securelend = new SecureLend('sk_test_...', {
  mcpURL: 'https://mcp.securelend.ai/sse', // Optional
});
```

### Compare Loans
```typescript
const result = await securelend.loans.compare({
  amount: 200000,
  purpose: 'working_capital',
  business: {
    revenue: 1200000,
    creditScore: 720,
    timeInBusiness: 36,
    industry: 'Retail',
    entityType: 'llc',
  },
  termPreferenceMonths: 60,
});

// Access best offer
const bestOffer = result.offers[0];
console.log(bestOffer.lender.name);
console.log(bestOffer.terms.interestRate.rate);
console.log(bestOffer.matching.approvalProbability);
```

### Calculate Loan Payment
```typescript
const calculation = await securelend.loans.calculate({
  amount: 200000,
  rate: 8.5,
  termMonths: 60,
  fees: {
    origination: 2000,
  },
});

console.log(`Monthly payment: $${calculation.monthlyPayment}`);
console.log(`Total interest: $${calculation.totalInterest}`);
console.log(`APR: ${calculation.apr}%`);
```

### Error Handling
```typescript
import { 
  SecureLendError, 
  AuthenticationError, 
  RateLimitError 
} from '@securelend/sdk';

try {
  // Connection can fail, or tool calls can fail
  const loans = await securelend.loans.compare({...});
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded, retry after:', error.retryAfter);
  } else if (error instanceof SecureLendError) {
    console.error('SecureLend error:', error.message);
    console.error('Error type:', error.type);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

This package includes TypeScript definitions:
```typescript
import type { 
  LoanOffer, 
  BankingAccount, 
  CreditCardOffer,
  BusinessProfile 
} from '@securelend/sdk';

const business: BusinessProfile = {
  basic: {
    legalName: 'Acme Corp',
    entityType: 'llc',
  },
  financials: {
    revenue: {
      annual: { amount: 1200000 },
    },
  },
};
```

## License

MIT
