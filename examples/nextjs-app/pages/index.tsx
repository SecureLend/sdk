import { useState } from 'react';
import { useLoanComparison, SecureLendWidget } from '@securelend/react';
import { LoanComparisonWidget } from '@securelend/widgets';
import type { BusinessLoanSearchParams } from '@securelend/sdk';

export default function Home() {
  const { compare, data, widget, loading, error } = useLoanComparison();
  const [loanAmount, setLoanAmount] = useState('50000');
  const [purpose, setPurpose] = useState('working_capital');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: BusinessLoanSearchParams = {
      loanAmount: parseInt(loanAmount, 10),
      purpose,
    };
    compare(request);
  };

  return (
    <main>
      <h1>SecureLend Next.js Example</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          placeholder="Loan Amount"
          required
        />
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Loan Purpose"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Comparing...' : 'Compare Loans'}
        </button>
      </form>

      {error && <p className="error">Error: {error.message}</p>}

      <div className="widget-container">
        {data && !widget && <LoanComparisonWidget response={data} />}
        {widget && <SecureLendWidget html={widget} />}
      </div>
    </main>
  );
}
