# SecureLend SDK

> **Official SDK for SecureLend - Financial services infrastructure for AI assistants**

[![npm version](https://badge.fury.io/js/%40securelend%2Fsdk.svg)](https://www.npmjs.com/package/@securelend/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

Production-ready client libraries for integrating SecureLend's financial comparison platform. Compare loans, banking, and credit cards with full type safety and MCP schema compliance.

## Features

- 🏦 **Financial Products** - Loans, banking, credit cards
- 🔒 **Type Safe** - Full TypeScript support
- ⚡ **Fast** - Automatic retries, rate limiting, caching
- 🎨 **React Ready** - Hooks and components included
- 🔌 **Framework Agnostic** - Works with any JavaScript framework
- 📱 **MCP Compliant** - Follows open standard schemas

## Quick Start

### Installation
```bash
npm install @securelend/sdk
```

### Basic Usage
```typescript
import { SecureLend } from '@securelend/sdk';

const securelend = new SecureLend('sk_test_...');

// Compare business loans
const loans = await securelend.loans.compare({
  amount: 200000,
  purpose: 'equipment_purchase',
  business: {
    revenue_annual: 1200000,
    credit_score: 720,
    time_in_business_months: 36
  }
});

console.log(`Found ${loans.summary.totalOffers} offers`);
console.log(`Best rate: ${loans.offers[0].terms.interestRate.rate}%`);
```

### React Usage
```typescript
import { useLoans } from '@securelend/react';

function LoanFinder() {
  const { offers, loading, error } = useLoans({
    client: securelend,
    request: {
      amount: 200000,
      purpose: 'equipment_purchase',
      business: { /* ... */ }
    }
  });

  if (loading) return <Spinner />;
  
  return (
    <div>
      {offers.map(offer => (
        <LoanCard key={offer.offerId} offer={offer} />
      ))}
    </div>
  );
}
```

## Available Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@securelend/sdk](./packages/core) | ![npm](https://img.shields.io/npm/v/@securelend/sdk) | Core SDK for TypeScript/JavaScript |
| [@securelend/react](./packages/react) | ![npm](https://img.shields.io/npm/v/@securelend/react) | React hooks and components |
| securelend-python | 🔜 Coming soon | Python SDK |

## Documentation

- 📖 [Full Documentation](https://docs.securelend.ai/sdk)
- 🚀 [Getting Started Guide](./docs/getting-started.md)
- 📚 [API Reference](./docs/api-reference/)
- 💡 [Examples](./examples)
- 🔗 [MCP Schemas](https://github.com/SecureLend/mcp-financial-services)

## Capabilities

### Loans
```typescript
// Compare business loans
const loans = await securelend.loans.compare({...});

// Compare personal loans
const personalLoans = await securelend.loans.comparePersonal({...});

// Calculate payments
const payment = await securelend.loans.calculate({
  amount: 200000,
  rate: 8.5,
  termMonths: 60
});
```

### Banking
```typescript
// Compare business banking accounts
const accounts = await securelend.banking.compare({
  accountType: 'checking',
  monthlyRevenue: 100000,
  monthlyTransactions: 500
});

// Estimate costs
const costs = await securelend.banking.estimateCosts({
  accountId: 'acc_123',
  projectedUsage: {
    monthlyTransactions: 500,
    averageBalance: 25000
  }
});
```

### Credit Cards
```typescript
// Compare business credit cards
const cards = await securelend.creditCards.compare({
  creditScore: 720,
  monthlySpend: 15000,
  spendCategories: [
    { category: 'advertising', monthlyAmount: 5000 },
    { category: 'travel', monthlyAmount: 3000 }
  ]
});

// Calculate rewards
const rewards = await securelend.creditCards.calculateRewards({
  cardId: 'card_123',
  annualSpend: { advertising: 60000, travel: 36000 }
});
```

## Why SecureLend SDK?

### For Developers
- ✅ **5 minutes to integrate** - Not weeks of partnership negotiations
- ✅ **One API** - Access multiple lenders, banks, card issuers
- ✅ **Type-safe** - Catch errors at compile time
- ✅ **Production-ready** - Battle-tested in real applications

### For AI Applications
- ✅ **MCP native** - Built for Model Context Protocol
- ✅ **Conversational** - Designed for natural language
- ✅ **Real-time** - Instant comparison results
- ✅ **Smart ranking** - ML-powered approval predictions

### For Businesses
- ✅ **Revenue share** - Earn from financial product leads
- ✅ **White-label** - Customize to match your brand
- ✅ **Compliant** - We handle regulations
- ✅ **Scalable** - From startup to enterprise

## Examples

### Next.js App
```typescript
// app/api/loans/route.ts
import { SecureLend } from '@securelend/sdk';

const client = new SecureLend(process.env.SECURELEND_API_KEY!);

export async function POST(request: Request) {
  const body = await request.json();
  const loans = await client.loans.compare(body);
  return Response.json(loans);
}
```

### Express API
```typescript
import express from 'express';
import { SecureLend } from '@securelend/sdk';

const app = express();
const securelend = new SecureLend(process.env.SECURELEND_API_KEY!);

app.post('/api/loans/compare', async (req, res) => {
  const loans = await securelend.loans.compare(req.body);
  res.json(loans);
});
```

### LangChain Integration
```typescript
import { SecureLendTool } from '@securelend/langchain';

const tools = [
  new SecureLendTool({
    apiKey: process.env.SECURELEND_API_KEY
  })
];

const agent = await initializeAgent(tools, llm);
```

## Error Handling
```typescript
import {
  SecureLendError,
  AuthenticationError,
  RateLimitError,
  ValidationError
} from '@securelend/sdk';

try {
  const loans = await securelend.loans.compare({...});
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
    console.log('Retry after:', error.retryAfter);
  } else if (error instanceof ValidationError) {
    console.error('Invalid request:', error.details);
  }
}
```

## Configuration
```typescript
const securelend = new SecureLend('sk_test_...', {
  timeout: 30000,        // Request timeout (ms)
  maxRetries: 3,         // Max retry attempts
  baseURL: 'https://api.securelend.ai/v1',  // API endpoint
  telemetry: true        // Send usage analytics
});

// Enable debug logging
securelend.enableDebug();
```

## Testing
```typescript
// Use test API keys
const securelend = new SecureLend('sk_test_...');

// Test mode returns mock data
const loans = await securelend.loans.compare({
  amount: 200000,
  purpose: 'equipment_purchase',
  business: { /* ... */ }
});
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
# Clone repository
git clone https://github.com/SecureLend/sdk.git
cd sdk

# Install dependencies
npm install

# Build packages
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## Support

- 📧 Email: [support@securelend.ai](mailto:support@securelend.ai)
- 💬 Discord: [Join our community](https://discord.gg/securelend)
- 🐛 Issues: [GitHub Issues](https://github.com/SecureLend/sdk/issues)
- 📖 Docs: [docs.securelend.ai](https://docs.securelend.ai)

## Related Projects

- [MCP Financial Services](https://github.com/SecureLend/mcp-financial-services) - Open-source schemas and MCP server
- [SecureLend API](https://docs.securelend.ai/api) - REST API documentation
- [SecureLend Examples](https://github.com/SecureLend/examples) - Sample applications

## License

MIT © [SecureLend](https://securelend.ai)

---

**Get started:** [Sign up for API key](https://developers.securelend.ai/signup) • [View documentation](https://docs.securelend.ai) • [Explore examples](./examples)
