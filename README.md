# SecureLend SDK

The official SDK for SecureLend - Financial services infrastructure for AI assistants.

## Packages

- [`@securelend/sdk`](./packages/sdk) - Core SDK for JavaScript/TypeScript
- [`@securelend/react`](./packages/react) - React hooks and components
- [`@securelend/widgets`](./packages/widgets) - Pre-built UI components for React
- [`securelend`](./packages/python) - Core SDK for Python
- More coming soon: Ruby, Go

## Quick Start

```bash
npm install @securelend/sdk
```

```typescript
import { SecureLend } from "@securelend/sdk";

const securelend = new SecureLend("sk_test_...");

const loans = await securelend.loans.compare({
  amount: 200000,
  purpose: "equipment",
  business: {
    revenue: 1200000,
    creditScore: 720,
    timeInBusiness: 36,
  },
});

console.log(`Best rate: ${loans.offers[0].terms.interestRate.rate}%`);
```

## Documentation

- [Documentation](https://docs.securelend.ai)
- [API Reference](https://docs.securelend.ai/api)
- [Guides](https://docs.securelend.ai/guides)
- [Examples](./examples)

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Lint
npm run lint
```

## License

MIT
