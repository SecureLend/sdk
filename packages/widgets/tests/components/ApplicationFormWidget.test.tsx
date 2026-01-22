/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApplicationFormWidget } from "../../src/components/ApplicationFormWidget";
import { useSubmitApplication } from "@securelend/react";
import {
  DisplayOfferFormResponse,
  ProductType,
} from "@securelend/sdk";

// Mock the useSubmitApplication hook
jest.mock("@securelend/react", () => ({
  ...jest.requireActual("@securelend/react"),
  useSubmitApplication: jest.fn(),
}));

const useSubmitApplicationMock = useSubmitApplication as jest.Mock;

const mockOffer = {
  offerId: "offer-1",
  lender: { id: "lender-1", name: "Test Lender", type: "BANK" },
  product: { name: "Test Loan", type: "INSTALLMENT_LOAN" },
  terms: {
    amount: { amount: 10000, currency: "USD" },
    interestRate: { type: "fixed" as const, apr: 0.05 },
    termMonths: 12,
    payment: { amount: { amount: 856.07, currency: "USD" } },
  },
};

const mockCreditCardOffer = {
  issuer: "CC Issuer",
  cardId: "cc-123",
};

const mockBankingOffer = {
  issuer: "Banking Issuer",
  accountId: "acct-123",
};

const mockOfferDataSingle: DisplayOfferFormResponse = {
  offer: mockOffer,
  allOffers: [mockOffer],
  applicationData: { loanAmount: 10000 },
  productType: ProductType.INSTALLMENT_LOAN,
};

const mockOfferDataMultiple: DisplayOfferFormResponse = {
  offer: mockOffer,
  allOffers: [
    mockOffer,
    {
      ...mockOffer,
      offerId: "offer-2",
      lender: { id: "lender-2", name: "Lender Two", type: "BANK" },
    },
  ],
  applicationData: { loanAmount: 10000 },
  productType: ProductType.INSTALLMENT_LOAN,
};

describe("ApplicationFormWidget", () => {
  let submitOfferMock: jest.Mock;
  let submitMultipleOffersMock: jest.Mock;
  let onSubmittedMock: jest.Mock;
  let onCancelMock: jest.Mock;

  beforeEach(() => {
    submitOfferMock = jest.fn().mockResolvedValue({ id: "app-123" });
    submitMultipleOffersMock = jest.fn().mockResolvedValue({ id: "app-456" });
    onSubmittedMock = jest.fn();
    onCancelMock = jest.fn();

    useSubmitApplicationMock.mockReturnValue({
      submitOffer: submitOfferMock,
      submitMultipleOffers: submitMultipleOffersMock,
      loading: false,
      data: null,
      error: null,
    });
  });

  it("renders form fields and single submit button correctly", () => {
    render(
      <ApplicationFormWidget
        offerData={mockOfferDataSingle}
        onSubmitted={onSubmittedMock}
      />,
    );
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByText("Submit to Test Lender")).toBeInTheDocument();
    expect(screen.queryByText(/Get All/)).not.toBeInTheDocument();
  });

  it("renders both submit buttons for multiple offers", () => {
    render(
      <ApplicationFormWidget
        offerData={mockOfferDataMultiple}
        onSubmitted={onSubmittedMock}
      />,
    );
    expect(screen.getByText("Submit to Test Lender")).toBeInTheDocument();
    expect(screen.getByText("Get All 2 Offers")).toBeInTheDocument();
  });

  it("handles user input", () => {
    render(
      <ApplicationFormWidget
        offerData={mockOfferDataSingle}
        onSubmitted={onSubmittedMock}
      />,
    );
    const firstNameInput = screen.getByLabelText(
      "First Name",
    ) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    expect(firstNameInput.value).toBe("John");
  });

  it("shows consent modal on single submit and proceeds on confirm", async () => {
    render(
      <ApplicationFormWidget
        offerData={mockOfferDataSingle}
        onSubmitted={onSubmittedMock}
      />,
    );

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "john@doe.com" },
    });
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByText("Submit to Test Lender"));

    expect(screen.getByText("Important Disclosures")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/I agree to the/));
    fireEvent.click(screen.getByText("I Understand, Proceed"));

    await waitFor(() => {
      expect(submitOfferMock).toHaveBeenCalled();
    });

    expect(submitOfferMock).toHaveBeenCalledWith({
      productType: "INSTALLMENT_LOAN",
      applicant: {
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
        phone: "1234567890",
      },
      applicationData: { loanAmount: 10000 },
      provider: { providerId: "lender-1", providerName: "Test Lender" },
    });

    await waitFor(() => {
      expect(onSubmittedMock).toHaveBeenCalledWith("single", { id: "app-123" });
    });
  });

  it("shows consent modal on multiple submit and proceeds on confirm with mixed offer types", async () => {
    const mockOfferDataHybrid: DisplayOfferFormResponse = {
      offer: mockOffer,
      allOffers: [mockOffer, mockCreditCardOffer as any, mockBankingOffer as any],
      applicationData: { loanAmount: 10000 },
      productType: ProductType.INSTALLMENT_LOAN,
    };

    render(
      <ApplicationFormWidget
        offerData={mockOfferDataHybrid}
        onSubmitted={onSubmittedMock}
      />,
    );

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "jane@doe.com" },
    });

    fireEvent.click(screen.getByText("Get All 3 Offers"));

    expect(screen.getByText("Important Disclosures")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/I agree to the/));
    fireEvent.click(screen.getByText("I Understand, Proceed"));

    await waitFor(() => {
      expect(submitMultipleOffersMock).toHaveBeenCalled();
    });

    expect(submitMultipleOffersMock).toHaveBeenCalledWith({
      productType: "INSTALLMENT_LOAN",
      applicant: {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@doe.com",
        phone: "",
      },
      applicationData: { loanAmount: 10000 },
      providers: [
        { providerId: "lender-1", providerName: "Test Lender" },
        { providerId: "cc-123", providerName: "CC Issuer" },
        { providerId: "acct-123", providerName: "Banking Issuer" },
      ],
    });

    await waitFor(() => {
      expect(onSubmittedMock).toHaveBeenCalledWith("multiple", { id: "app-456" });
    });
  });

  it("handles cancelling the consent modal", () => {
    render(
      <ApplicationFormWidget
        offerData={mockOfferDataSingle}
        onSubmitted={onSubmittedMock}
      />,
    );
    fireEvent.click(screen.getByText("Submit to Test Lender"));
    expect(screen.getByText("Important Disclosures")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Important Disclosures")).not.toBeInTheDocument();
  });

  it("calls onCancel when back button is clicked", () => {
    render(
      <ApplicationFormWidget
        offerData={mockOfferDataSingle}
        onSubmitted={onSubmittedMock}
        onCancel={onCancelMock}
      />,
    );
    expect(screen.getByText("Back to Offers")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Back to Offers"));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it("disables buttons and shows loading text", () => {
    useSubmitApplicationMock.mockReturnValue({
      ...useSubmitApplicationMock(),
      loading: true,
    });

    const { rerender } = render(
      <ApplicationFormWidget
        offerData={mockOfferDataMultiple}
        onSubmitted={onSubmittedMock}
      />,
    );

    // Simulate starting a single submission to set internal state
    fireEvent.click(screen.getByText("Submit to Test Lender"));
    rerender(
      <ApplicationFormWidget
        offerData={mockOfferDataMultiple}
        onSubmitted={onSubmittedMock}
      />,
    );
    expect(screen.getByText("Submitting...")).toBeDisabled();
  });

  it("logs an error if provider info cannot be determined for single submit", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const offerDataWithNoProvider = {
      ...mockOfferDataSingle,
      offer: { offerId: "test" } as any, // An object that doesn't match getProviderInfo logic
    };
    render(
      <ApplicationFormWidget
        offerData={offerDataWithNoProvider}
        onSubmitted={onSubmittedMock}
      />,
    );

    fireEvent.click(screen.getByText(/Submit to/));
    fireEvent.click(screen.getByLabelText(/I agree to the/));
    fireEvent.click(screen.getByText("I Understand, Proceed"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Could not determine provider info from offer.",
      );
    });
    expect(submitOfferMock).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("logs an error if provider info cannot be determined for multiple submit", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const offerDataWithNoProvider = {
      ...mockOfferDataMultiple,
      allOffers: [{ offerId: "test1" }, { offerId: "test2" }] as any,
    };
    render(
      <ApplicationFormWidget
        offerData={offerDataWithNoProvider}
        onSubmitted={onSubmittedMock}
      />,
    );

    fireEvent.click(screen.getByText("Get All 2 Offers"));
    fireEvent.click(screen.getByLabelText(/I agree to the/));
    fireEvent.click(screen.getByText("I Understand, Proceed"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Could not determine provider for any of the offers.",
      );
    });
    expect(submitMultipleOffersMock).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("handles submission failure", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockError = new Error("Submission failed");
    submitOfferMock.mockRejectedValue(mockError);

    render(
      <ApplicationFormWidget
        offerData={mockOfferDataSingle}
        onSubmitted={onSubmittedMock}
      />,
    );

    fireEvent.click(screen.getByText("Submit to Test Lender"));
    fireEvent.click(screen.getByLabelText(/I agree to the/));
    fireEvent.click(screen.getByText("I Understand, Proceed"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Submission failed:", mockError);
    });
    expect(onSubmittedMock).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
