# @securelend/widgets

Pre-built React UI components for the SecureLend SDK.

This package provides production-ready components to quickly build user interfaces for financial product comparison.

## Installation

```bash
npm install @securelend/sdk @securelend/widgets
```

## Quick Start

Import the components and use them in your React application.

```tsx
import { LoanComparisonWidget } from '@securelend/widgets';
import { useLoanComparison } from '@securelend/react'; // Assuming you use the hooks package

function LoanFinder() {
  const { data, loading, compare } = useLoanComparison();

  // ... logic to call compare() ...

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data yet.</p>;

  return (
    <div>
      <LoanComparisonWidget response={data} />
    </div>
  );
}
```

## Available Widgets

- `LoanComparisonWidget`
- `BankingComparisonWidget` (coming soon)
- `CreditCardComparisonWidget` (coming soon)
