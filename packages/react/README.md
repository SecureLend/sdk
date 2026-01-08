# @securelend/react

React hooks and components for the SecureLend SDK.

## Installation

```bash
npm install @securelend/sdk @securelend/react
```

## Quick Start

Wrap your application with the `SecureLendProvider` and provide your API key.

```tsx
// src/App.tsx
import { SecureLendProvider } from '@securelend/react';

function App() {
  return (
    <SecureLendProvider apiKey={process.env.REACT_APP_SECURELEND_API_KEY}>
      <YourAppComponent />
    </SecureLendProvider>
  );
}
```

Then, use the custom hooks to interact with the SecureLend API.

```tsx
// src/components/LoanFinder.tsx
import { useLoanComparison, SecureLendWidget } from '@securelend/react';

function LoanFinder() {
  const { data, loading, error, widget, compare } = useLoanComparison();

  const handleCompare = () => {
    compare({
      amount: 200000,
      purpose: "equipment",
      business: {
        revenue: 1200000,
        creditScore: 720,
        timeInBusiness: 36,
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button onClick={handleCompare}>Compare Loans</button>
      {widget ? (
        <SecureLendWidget html={widget} />
      ) : (
        data?.offers.map(offer => (
          <div key={offer.offerId}>
            <h3>{offer.lender.name}</h3>
            <p>Rate: {offer.terms.interestRate.rate}%</p>
          </div>
        ))
      )}
    </div>
  );
}
```
