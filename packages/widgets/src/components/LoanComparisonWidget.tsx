import type { LoanComparisonResponse } from "@securelend/sdk";

interface LoanComparisonWidgetProps {
  response: LoanComparisonResponse;
  className?: string;
}

export function LoanComparisonWidget({
  response,
  className,
}: LoanComparisonWidgetProps) {
  const { offers, summary } = response;

  if (!offers || offers.length === 0) {
    return (
      <div className={`sl-widget ${className || ""}`}>
        <div className="sl-widget-header">
          <h3>No loan offers available.</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`sl-widget ${className || ""}`}>
      <div className="sl-widget-header">
        <h3>Found {summary.totalOffers} Loan Offers</h3>
      </div>
      <table className="sl-widget-table">
        <thead>
          <tr>
            <th>Lender</th>
            <th>Product</th>
            <th>Interest Rate</th>
            <th>Term</th>
            <th>Monthly Payment</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.offerId}>
              <td className="sl-widget-lender">{offer.lenderName}</td>
              <td>{offer.productName}</td>
              <td className="sl-widget-rate">
                {offer.interestRate.toFixed(2)}%
              </td>
              <td>{offer.termMonths} months</td>
              <td>${offer.monthlyPayment.toFixed(2)}</td>
              <td>
                {offer.applicationUrl && (
                  <a
                    href={offer.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sl-widget-button"
                  >
                    Apply
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
