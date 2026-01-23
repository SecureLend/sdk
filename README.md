# SecureLend SDK

> **Official TypeScript SDK for SecureLend financial services**

Connect to SecureLend's MCP server programmatically or integrate with Claude and ChatGPT.

[![npm version](https://img.shields.io/npm/v/@securelend/sdk.svg)](https://www.npmjs.com/package/@securelend/sdk)
![Test Coverage](shields/coverage-badge.svg)
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
  `Best rate: ${bestOffer.interestRate}% from ${bestOffer.lenderName}`,
);
```

---

## Configuration

### API Key & Custom Server URL

You can pass configuration when creating a client. The MCP server is public and does not require an API key. Providing one is recommended for usage tracking and to prepare for future updates that may use it for rate limiting.

```typescript
import { SecureLend } from "@securelend/sdk";

const securelend = new SecureLend({
  // The API key is optional but recommended.
  // It's best to load it from a secure source, like environment variables.
  apiKey: process.env.SECURELEND_API_KEY,

  // Optional: Override the default MCP server URL
  serverUrl: "https://custom-mcp-server.com/mcp",
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
    console.error(`SecureLend Error: ${error.type}`);
    console.error(`Message: ${error.message}`);
    if (error.details) {
      console.error("Details:", error.details);
    }
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

React hooks and components for the SecureLend SDK

**Status:** ✅ In Development (Beta)

**Example Usage:**

```tsx
import { useLoanComparison } from "@securelend/react";
import { LoanComparisonWidget } from "@securelend/widgets";

function LoanFinder() {
  const { compare, data, loading, error } = useLoanComparison();

  const handleSearch = () => {
    compare({
      loanAmount: 200000,
      purpose: "equipment",
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleSearch}>Find Loans</button>
      {data && <LoanComparisonWidget response={data} />}
    </div>
  );
}
```

### [@securelend/widgets](./packages/widgets)

Pre-built React UI components for the SecureLend SDK

**Status:** ✅ In Development (Beta)

### [Python SDK](./packages/python)

[![PyPI version](https://img.shields.io/pypi/v/securelend.svg)](https://pypi.org/project/securelend/)

Python client library for the SecureLend SDK

**Status:** ✅ Published

**Example Usage:**

```python
import asyncio
import os
from securelend import SecureLend

async def main():
    # The API server is public and does not require an API key.
    # A key can optionally be provided for usage tracking.
    async with SecureLend(api_key=os.environ.get("SECURELEND_API_KEY")) as securelend:
        response = await securelend.compare_business_loans({
            "loanAmount": 200000,
            "purpose": "equipment",
            "annualRevenue": 1200000,
        })

        print(f"Found {response.summary.total_offers} loan offers.")

        if response.offers:
            top_offer = response.offers[0]
            apr = top_offer.terms.interest_rate.apr * 100
            print(f"Top offer from {top_offer.lender.name} with {apr:.2f}% APR.")

            # Calculate payment details for the top offer
            payment_details = await securelend.calculate_loan_payment({
                "loanAmount": top_offer.terms.amount.amount,
                "interestRate": apr,
                "loanTermInMonths": top_offer.terms.term_months,
            })
            print(f"  - Estimated Monthly Payment: ${payment_details.monthly_payment:,.2f}")

if __name__ == "__main__":
    asyncio.run(main())
```

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

Publishing is handled by Lerna to ensure all packages are versioned and published correctly.

```bash
# Make sure you are logged into npm
npm login

# Run the publish script from the root of the repository
npm run publish:all
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

MIT © 2026 SecureLend, Inc.

---

## Related Projects

- **[mcp-financial-services](https://github.com/SecureLend/mcp-financial-services)** - MCP server schemas and docs
- **[SecureLend Docs](https://github.com/SecureLend/docs)** - Documentation site source

---

**Built by [SecureLend](https://securelend.ai)** • [Docs](https://docs.securelend.ai) • [MCP Server](https://docs.securelend.ai/mcp) • [Privacy](https://securelend.ai/legal/privacy) [Terms](https://securelend.ai/legal/terms)
