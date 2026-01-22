/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { BankingComparisonWidget } from "../../src/components/BankingComparisonWidget";
import { BusinessBankingComparisonResponse } from "@securelend/sdk";

const mockResponse: BusinessBankingComparisonResponse = {
  offers: [
    {
      accountId: "acc-1",
      issuer: "Bank A",
      name: "Business Checking",
      bestFor: "Small Businesses",
      apy: "1.5%",
      monthlyFee: "$10",
      imageUrl: "",
      rating: 4.5,
      bonus: "None",
    },
    {
      accountId: "acc-2",
      issuer: "Bank B",
      name: "Premium Business Checking",
      bestFor: "Large Businesses",
      apy: "0.5%",
      monthlyFee: "$25",
      imageUrl: "",
      rating: 4.8,
      bonus: "$300",
    },
  ],
  metadata: {
    queryId: "query-123",
    timestamp: "2023-01-01T00:00:00Z",
  },
};

const mockEmptyResponse: BusinessBankingComparisonResponse = {
  offers: [],
  metadata: {
    queryId: "query-empty",
    timestamp: "2023-01-01T00:00:00Z",
  },
};

describe("BankingComparisonWidget", () => {
  it("should render a message when no offers are available", () => {
    render(<BankingComparisonWidget response={mockEmptyResponse} />);
    expect(screen.getByText("No banking offers available.")).toBeInTheDocument();
  });

  it("should render a table with banking offers", () => {
    render(<BankingComparisonWidget response={mockResponse} />);
    expect(screen.getByText("Found 2 Banking Offers")).toBeInTheDocument();
    expect(screen.getByText("Bank A")).toBeInTheDocument();
    expect(screen.getByText("Business Checking")).toBeInTheDocument();
    expect(screen.getByText("Small Businesses")).toBeInTheDocument();
    expect(screen.getByText("1.5%")).toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <BankingComparisonWidget response={mockResponse} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("sl-widget");
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should apply default className when none is provided", () => {
    const { container } = render(<BankingComparisonWidget response={mockResponse} />);
    expect(container.firstChild).toHaveClass("sl-widget");
    expect(container.firstChild).not.toHaveClass("undefined");
  });
});
