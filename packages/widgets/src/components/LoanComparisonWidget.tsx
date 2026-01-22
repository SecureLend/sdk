import type { LoanComparisonResponse, LoanOffer } from "@securelend/sdk";

interface LoanComparisonWidgetProps {
  response: LoanComparisonResponse;
  className?: string;
  onApplyClick?: (offer: LoanOffer) => void;
}

export function LoanComparisonWidget({
  response,
  className,
  onApplyClick,
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
              <td className="sl-widget-lender">{offer.lender.name}</td>
              <td>{offer.product.name}</td>
              <td className="sl-widget-rate">
                {(offer.terms.interestRate.apr * 100).toFixed(2)}%
              </td>
              <td>{offer.terms.termMonths} months</td>
              <td>${offer.terms.payment.amount.amount.toFixed(2)}</td>
              <td>
                {onApplyClick ? (
                  <button
                    onClick={() => onApplyClick(offer)}
                    className="sl-widget-button"
                  >
                    Apply
                  </button>
                ) : offer.process?.applicationUrl ? (
                  <a
                    href={offer.process.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sl-widget-button"
                  >
                    Apply
                  </a>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
