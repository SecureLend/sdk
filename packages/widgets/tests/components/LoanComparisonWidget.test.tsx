/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from "@testing-library/react";
import { LoanComparisonWidget } from "../../src/components/LoanComparisonWidget";
import { LoanComparisonResponse, LoanOffer } from "@securelend/sdk";

const mockOffer1: LoanOffer = {
  offerId: "offer-1",
  lender: { id: "lender-1", name: "Lender One", type: "BANK" },
  product: { name: "Product A", type: "INSTALLMENT_LOAN" },
  terms: {
    amount: { amount: 10000, currency: "USD" },
    interestRate: { type: "fixed", apr: 0.05 },
    termMonths: 12,
    payment: { amount: { amount: 856.07, currency: "USD" } },
  },
  process: {
    applicationMethod: "online",
    applicationUrl: "https://example.com/apply/1",
  },
};

const mockOffer2: LoanOffer = {
  offerId: "offer-2",
  lender: { id: "lender-2", name: "Lender Two", type: "CREDIT_UNION" },
  product: { name: "Product B", type: "INSTALLMENT_LOAN" },
  terms: {
    amount: { amount: 15000, currency: "USD" },
    interestRate: { type: "fixed", apr: 0.06 },
    termMonths: 24,
    payment: { amount: { amount: 664.03, currency: "USD" } },
  },
  process: {
    applicationMethod: "online",
  }, // no applicationUrl
};

const mockResponse: LoanComparisonResponse = {
  offers: [mockOffer1, mockOffer2],
  summary: {
    totalOffers: 2,
    bestRate: 0.05,
  },
  metadata: {
    queryId: "query-123",
    timestamp: "2023-01-01T00:00:00Z",
  },
};

const mockEmptyResponse: LoanComparisonResponse = {
  offers: [],
  summary: { totalOffers: 0, bestRate: 0 },
  metadata: {
    queryId: "query-empty",
    timestamp: "2023-01-01T00:00:00Z",
  },
};

describe("LoanComparisonWidget", () => {
  it("should render a message when no offers are available", () => {
    render(<LoanComparisonWidget response={mockEmptyResponse} />);
    expect(screen.getByText("No loan offers available.")).toBeInTheDocument();
  });

  it("should render a table with loan offers", () => {
    render(<LoanComparisonWidget response={mockResponse} />);
    expect(screen.getByText("Found 2 Loan Offers")).toBeInTheDocument();
    expect(screen.getByText("Lender One")).toBeInTheDocument();
    expect(screen.getByText("Lender Two")).toBeInTheDocument();
    expect(screen.getByText("5.00%")).toBeInTheDocument();
    expect(screen.getByText("6.00%")).toBeInTheDocument();
    expect(screen.getByText("$856.07")).toBeInTheDocument();
    expect(screen.getByText("$664.03")).toBeInTheDocument();
  });

  it("should call onApplyClick when button is clicked", () => {
    const onApplyClick = jest.fn();
    render(
      <LoanComparisonWidget response={mockResponse} onApplyClick={onApplyClick} />,
    );
    const buttons = screen.getAllByText("Learn More");
    fireEvent.click(buttons[0]);
    expect(onApplyClick).toHaveBeenCalledWith(mockOffer1);
    fireEvent.click(buttons[1]);
    expect(onApplyClick).toHaveBeenCalledWith(mockOffer2);
  });

  it("should render an anchor tag if onApplyClick is not provided but URL is", () => {
    render(<LoanComparisonWidget response={mockResponse} />);
    const link = screen.getByRole("link", { name: "Learn More" });
    expect(link).toHaveAttribute("href", "https://example.com/apply/1");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("should not render a button or link if neither onApplyClick nor URL is provided", () => {
    const singleOfferResponse = { ...mockResponse, offers: [mockOffer2] };
    render(<LoanComparisonWidget response={singleOfferResponse} />);
    expect(screen.queryByText("Learn More")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <LoanComparisonWidget response={mockResponse} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("sl-widget");
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should apply default className when none is provided", () => {
    const { container } = render(<LoanComparisonWidget response={mockResponse} />);
    expect(container.firstChild).toHaveClass("sl-widget");
    expect(container.firstChild).not.toHaveClass("undefined");
  });
});
