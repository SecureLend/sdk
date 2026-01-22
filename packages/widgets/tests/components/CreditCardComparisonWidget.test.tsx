/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { CreditCardComparisonWidget } from "../../src/components/CreditCardComparisonWidget";
import {
  PersonalCreditCardComparisonResponse,
  PersonalCreditCardOffer,
} from "@securelend/sdk";

const mockOffer1: PersonalCreditCardOffer = {
  cardId: "card-1",
  name: "Card One",
  issuer: "Issuer A",
  imageUrl: "",
  rating: 4.5,
  bestFor: "Travel",
  rewardsRate: "2x points",
  introOffer: "$200 bonus",
  recommendedCreditScore: "700-850",
  terms: {
    apr: { purchase: 15.99, balanceTransfer: 15.99 },
    fees: { annual: 95 },
  },
  applicationUrl: "https://example.com/apply/1",
};

const mockOffer2: PersonalCreditCardOffer = {
  cardId: "card-2",
  name: "Card Two",
  issuer: "Issuer B",
  imageUrl: "",
  rating: 4.2,
  bestFor: "Cash Back",
  rewardsRate: "1.5% cash back",
  introOffer: "0% APR for 12 months",
  recommendedCreditScore: "650-750",
  terms: {
    apr: { purchase: 18.99, balanceTransfer: 18.99 },
    fees: { annual: 0 },
  },
  // No applicationUrl
};

const mockResponse: PersonalCreditCardComparisonResponse = {
  offers: [mockOffer1, mockOffer2],
  metadata: {
    queryId: "query-123",
    timestamp: "2023-01-01T00:00:00Z",
  },
};

const mockEmptyResponse: PersonalCreditCardComparisonResponse = {
  offers: [],
  metadata: {
    queryId: "query-empty",
    timestamp: "2023-01-01T00:00:00Z",
  },
};

describe("CreditCardComparisonWidget", () => {
  it("should render a message when no offers are available", () => {
    render(<CreditCardComparisonWidget response={mockEmptyResponse} />);
    expect(
      screen.getByText("No credit card offers available."),
    ).toBeInTheDocument();
  });

  it("should render a table with credit card offers", () => {
    render(<CreditCardComparisonWidget response={mockResponse} />);
    expect(screen.getByText("Found 2 Credit Card Offers")).toBeInTheDocument();
    expect(screen.getByText("Issuer A")).toBeInTheDocument();
    expect(screen.getByText("Card One")).toBeInTheDocument();
    expect(screen.getByText("2x points")).toBeInTheDocument();
    expect(screen.getByText("$200 bonus")).toBeInTheDocument();
  });

  it("should render an anchor tag if applicationUrl is provided", () => {
    render(<CreditCardComparisonWidget response={mockResponse} />);
    const link = screen.getByRole("link", { name: "Learn More" });
    expect(link).toHaveAttribute("href", "https://example.com/apply/1");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("should not render a link if applicationUrl is not provided", () => {
    const singleOfferResponse = { ...mockResponse, offers: [mockOffer2] };
    render(<CreditCardComparisonWidget response={singleOfferResponse} />);
    expect(screen.queryByText("Learn More")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CreditCardComparisonWidget
        response={mockResponse}
        className="custom-class"
      />,
    );
    expect(container.firstChild).toHaveClass("sl-widget");
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should apply default className when none is provided", () => {
    const { container } = render(
      <CreditCardComparisonWidget response={mockResponse} />,
    );
    expect(container.firstChild).toHaveClass("sl-widget");
    expect(container.firstChild).not.toHaveClass("undefined");
  });
});
