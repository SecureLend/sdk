# SecureLend SDK

> **Official TypeScript SDK for SecureLend financial services**

Connect to SecureLend's MCP server programmatically or integrate with Claude and ChatGPT.

[![npm version](https://img.shields.io/npm/v/@securelend/sdk.svg)](https://www.npmjs.com/package/@securelend/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

---

## Features

- 🔌 **Direct MCP Connection** - Connect to `https://mcp.securelend.ai/mcp`
- 📝 **Full TypeScript Support** - Complete type definitions for all 20 tools
- 🚀 **Zero Configuration** - Works out of the box with production server
- 🔄 **Promise-based API** - Modern async/await interface
- 🎯 **Type-Safe** - Catch errors at compile time
- 📦 **Lightweight** - Minimal dependencies

---

## Installation

```bash
npm install @securelend/sdk
# or
pnpm add @securelend/sdk
# or
yarn add @securelend/sdk
```

---

## Quick Start

### Basic Usage

```typescript
import { SecureLend } from "@securelend/sdk";

// Create client - connects to https://mcp.securelend.ai/mcp by default
const securelend = new SecureLend();

// Compare business loans
const result = await securelend.compareBusinessLoans({
  loanAmount: 200000,
  purpose: "equipment",
  annualRevenue: 1200000,
});

// Type-safe access to results
console.log(`Found ${result.offers.length} loan offers`);
result.offers.forEach((offer) => {
  console.log(`${offer.lender.name}: ${offer.terms.interestRate.apr}% APR`);
});
```

### Calculate Mortgage Payment

```typescript
const payment = await securelend.calculateMortgagePayment({
  propertyValue: 400000,
  downPayment: 80000,
  interestRate: 6.5,
  loanTermInYears: 30,
  propertyTaxRate: 1.2,
  homeInsurance: 1500,
});

console.log(`Monthly PITI: $${payment.monthlyPayment}`);
console.log(`Principal & Interest: $${payment.principalAndInterest}`);
console.log(`Property Taxes: $${payment.propertyTaxes}`);
console.log(`Insurance: $${payment.insurance}`);
```

### Compare Personal Loans

```typescript
const loans = await securelend.comparePersonalLoans({
  loanAmount: 25000,
  purpose: "debt_consolidation",
  creditScore: 720,
  state: "CA",
});

// Get best rate
const bestOffer = loans.offers[0];
console.log(
  `Best rate: ${bestOffer.terms.interestRate.apr}% from ${bestOffer.lender.name}`,
);
```

---

## Configuration

### Custom Server URL

```typescript
import { SecureLend } from "@securelend/sdk";

const securelend = new SecureLend({
  serverUrl: "https://custom-mcp-server.com/mcp",
  timeout: 30000, // 30 seconds
});
```

### TypeScript Configuration

The SDK includes complete TypeScript definitions:

```typescript
import {
  SecureLend,
  BusinessLoanComparisonRequest,
  LoanComparisonResponse,
  MortgageCalculationRequest,
  MortgageCalculationResponse,
} from "@securelend/sdk";

// Fully typed requests and responses
const request: BusinessLoanComparisonRequest = {
  loanAmount: 200000,
  purpose: "equipment",
  annualRevenue: 1200000,
};

const response: LoanComparisonResponse =
  await securelend.compareBusinessLoans(request);
```

---

## Available Methods

### Loan Comparison (6 methods)

| Method                       | Description                  |
| ---------------------------- | ---------------------------- |
| `comparePersonalLoans()`     | Compare personal loan offers |
| `compareBusinessLoans()`     | Compare business loan offers |
| `compareCarLoans()`          | Compare auto loan rates      |
| `compareStudentLoans()`      | Compare student loan options |
| `comparePersonalMortgages()` | Compare mortgage rates       |
| `compareBusinessMortgages()` | Compare commercial mortgages |

### Banking & Credit Cards (5 methods)

| Method                         | Description                       |
| ------------------------------ | --------------------------------- |
| `comparePersonalBanking()`     | Compare checking/savings accounts |
| `compareBusinessBanking()`     | Compare business banking products |
| `compareSavingsAccounts()`     | Compare high-yield savings        |
| `comparePersonalCreditCards()` | Compare personal credit cards     |
| `compareBusinessCreditCards()` | Compare business credit cards     |

### Financial Calculators (3 methods)

| Method                       | Description                      |
| ---------------------------- | -------------------------------- |
| `calculateLoanPayment()`     | Calculate monthly loan payments  |
| `calculateMortgagePayment()` | Calculate PITI mortgage payments |
| `compareLeaseVsPurchase()`   | Compare vehicle lease vs buy     |

### Application Management (6 methods)

| Method                         | Description                      |
| ------------------------------ | -------------------------------- |
| `getOffer()`                   | Submit application to one lender |
| `getMultipleOffers()`          | Submit to multiple lenders       |
| `trackOfferStatus()`           | Check application status         |
| `displayOfferForm()`           | Generate pre-filled form         |
| `displayUploadDocumentsForm()` | Upload documents interface       |
| `submitDocuments()`            | Submit application documents     |

**Total: 20 methods** covering all SecureLend MCP tools

[Full API Reference →](https://docs.securelend.ai/sdk/javascript)

---

## Examples

### Complete Loan Comparison Flow

```typescript
import { SecureLend } from "@securelend/sdk";

async function findBestBusinessLoan() {
  const securelend = new SecureLend();

  // 1. Compare offers
  const comparison = await securelend.compareBusinessLoans({
    loanAmount: 200000,
    purpose: "equipment",
    annualRevenue: 1200000,
    industry: "technology",
    state: "CA",
  });

  console.log(`Found ${comparison.offers.length} offers`);

  // 2. Show top 3 offers
  comparison.offers.slice(0, 3).forEach((offer, i) => {
    console.log(`\n${i + 1}. ${offer.lender.name}`);
    console.log(`   Rate: ${offer.terms.interestRate.apr}% APR`);
    console.log(`   Monthly: $${offer.terms.payment?.amount.amount}`);
    console.log(`   Term: ${offer.terms.termMonths} months`);
  });

  // 3. Calculate payment for best offer
  const bestOffer = comparison.offers[0];
  const payment = await securelend.calculateLoanPayment({
    loanAmount: bestOffer.terms.amount.amount,
    interestRate: bestOffer.terms.interestRate.rate,
    loanTermInMonths: bestOffer.terms.termMonths,
  });

  console.log(`\nBest offer payment breakdown:`);
  console.log(`Monthly: $${payment.monthlyPayment}`);
  console.log(`Total Interest: $${payment.totalInterest}`);
  console.log(`Total Paid: $${payment.totalPayment}`);

  return bestOffer;
}

findBestBusinessLoan().catch(console.error);
```

### Error Handling

```typescript
import { SecureLend, SecureLendError } from "@securelend/sdk";

const securelend = new SecureLend();

try {
  const loans = await securelend.compareBusinessLoans({
    loanAmount: 200000,
    purpose: "equipment",
  });

  console.log(`Found ${loans.offers.length} offers`);
} catch (error) {
  if (error instanceof SecureLendError) {
    console.error("SecureLend Error:", error.code);
    console.error("Message:", error.message);
    console.error("Details:", error.details);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Using with Next.js

```typescript
// app/api/compare-loans/route.ts
import { SecureLend } from "@securelend/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const securelend = new SecureLend();

  try {
    const result = await securelend.compareBusinessLoans({
      loanAmount: body.amount,
      purpose: body.purpose,
      annualRevenue: body.revenue,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to compare loans" },
      { status: 500 },
    );
  }
}
```

---

## Architecture

The SDK is a lightweight wrapper around the SecureLend MCP server:
┌─────────────────────────────┐
│ Your Application │
│ (Node.js, React, etc.) │
└─────────────────────────────┘
↓
┌─────────────────────────────┐
│ @securelend/sdk │
│ • Type definitions │
│ • Method wrappers │
│ • Error handling │
└─────────────────────────────┘
↓ MCP Protocol
┌─────────────────────────────┐
│ mcp.securelend.ai/mcp │
│ • 20 financial tools │
│ • Lender integrations │
│ • Real-time data │
└─────────────────────────────┘

**Benefits:**

- ✅ No API keys required (public MCP server)
- ✅ Always up-to-date (connects to live server)
- ✅ No server-side maintenance
- ✅ Type-safe development experience

---

## Packages

This is a monorepo containing multiple packages:

### [@securelend/sdk](./packages/sdk)

Core TypeScript SDK - works in Node.js and browsers

**Status:** ✅ In Development (Beta)

### [@securelend/react](./packages/react)

React hooks and components

**Status:** 🔄 Coming Soon

**Planned API:**

```typescript
import { useLoans, useLoanCalculator } from '@securelend/react';

function LoanFinder() {
  const { data, loading, error } = useLoans({
    loanAmount: 200000,
    purpose: 'equipment'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.offers.map(offer => (
        <LoanCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
```

### Python SDK

Python client library

**Status:** 🔄 Planned for Q2 2025

---

## Documentation

- **[Complete Documentation](https://docs.securelend.ai)** - Full docs site
- **[SDK Reference](https://docs.securelend.ai/sdk/javascript)** - API reference
- **[MCP Tools](https://docs.securelend.ai/mcp/tools)** - Tool documentation
- **[Examples](https://docs.securelend.ai/sdk/examples)** - Code examples
- **[GitHub](https://github.com/SecureLend/sdk)** - Source code

---

## For AI Assistant Integration

If you want to use SecureLend with Claude Desktop or ChatGPT instead of programmatic access:

### Claude Desktop

Download one-click installer: [extensions.securelend.ai](https://extensions.securelend.ai)

Or manually configure:

```json
{
  "mcpServers": {
    "securelend": {
      "url": "https://mcp.securelend.ai/mcp"
    }
  }
}
```

### ChatGPT

Search for "SecureLend Financial Services" in the GPT store.

[Full setup guide →](https://docs.securelend.ai/mcp/setup)

---

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/SecureLend/sdk.git
cd sdk

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

### Project Structure

sdk/
├── packages/
│ ├── sdk/ # @securelend/sdk
│ │ ├── src/
│ │ │ ├── client.ts
│ │ │ ├── types.ts
│ │ │ └── index.ts
│ │ ├── tests/
│ │ └── package.json
│ └── react/ # @securelend/react (planned)
├── examples/ # Usage examples
├── .github/
│ └── workflows/ # CI/CD
├── package.json # Root package
└── tsconfig.json # TypeScript config

### Publishing

```bash
# Build all packages
npm run build

# Test before publishing
npm test

# Publish to npm (requires auth)
cd packages/sdk
npm publish --access public
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Ways to contribute:**

- Report bugs or issues
- Suggest new features
- Improve documentation
- Submit pull requests

---

## Support

- **Documentation:** https://docs.securelend.ai
- **Email:** developers@securelend.ai
- **GitHub Issues:** https://github.com/SecureLend/sdk/issues
- **Status Page:** https://status.securelend.ai

---

## License

MIT © 2025 SecureLend, Inc.

---

## Related Projects

- **[mcp-financial-services](https://github.com/SecureLend/mcp-financial-services)** - MCP server schemas and docs
- **[SecureLend Docs](https://github.com/SecureLend/docs)** - Documentation site source

---

**Built by [SecureLend](https://securelend.ai)** • [Docs](https://docs.securelend.ai) • [MCP Server](https://docs.securelend.ai/mcp) • [Privacy](https://securelend.ai/legal/privacy) [Terms](https://securelend.ai/legal/terms)
