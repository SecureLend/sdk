import type { BusinessBankingComparisonResponse } from "@securelend/sdk";

interface BankingComparisonWidgetProps {
  response: BusinessBankingComparisonResponse;
  className?: string;
}

export function BankingComparisonWidget({
  response,
  className,
}: BankingComparisonWidgetProps) {
  const { offers } = response;

  if (!offers || offers.length === 0) {
    return (
      <div className={`sl-widget ${className || ""}`}>
        <div className="sl-widget-header">
          <h3>No banking offers available.</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`sl-widget ${className || ""}`}>
      <div className="sl-widget-header">
        <h3>Found {offers.length} Banking Offers</h3>
      </div>
      <table className="sl-widget-table">
        <thead>
          <tr>
            <th>Issuer</th>
            <th>Account</th>
            <th>Best For</th>
            <th>APY</th>
            <th>Monthly Fee</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.accountId}>
              <td className="sl-widget-lender">{offer.issuer}</td>
              <td>{offer.name}</td>
              <td>{offer.bestFor}</td>
              <td>{offer.apy}</td>
              <td>{offer.monthlyFee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
