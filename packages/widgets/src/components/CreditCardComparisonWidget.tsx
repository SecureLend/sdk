import type { PersonalCreditCardComparisonResponse } from "@securelend/sdk";

interface CreditCardComparisonWidgetProps {
  response: PersonalCreditCardComparisonResponse;
  className?: string;
}

export function CreditCardComparisonWidget({
  response,
  className,
}: CreditCardComparisonWidgetProps) {
  const { offers } = response;

  if (!offers || offers.length === 0) {
    return (
      <div className={`sl-widget ${className || ""}`}>
        <div className="sl-widget-header">
          <h3>No credit card offers available.</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`sl-widget ${className || ""}`}>
      <div className="sl-widget-header">
        <h3>Found {offers.length} Credit Card Offers</h3>
      </div>
      <table className="sl-widget-table">
        <thead>
          <tr>
            <th>Issuer</th>
            <th>Card</th>
            <th>Rewards</th>
            <th>Intro Offer</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.cardId}>
              <td className="sl-widget-lender">{offer.issuer}</td>
              <td>{offer.name}</td>
              <td>{offer.rewardsRate}</td>
              <td>{offer.introOffer}</td>
              <td>
                {offer.applicationUrl && (
                  <a
                    href={offer.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sl-widget-button"
                  >
                    Learn More
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
