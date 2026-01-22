/// <reference types="@testing-library/jest-dom" />
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { SecureLendProvider } from "../../src/contexts/SecureLendProvider";
import { useDisplayOfferForm } from "../../src/hooks/useDisplayOfferForm";
import { SecureLend, SecureLendError } from "@securelend/sdk";

// Mock the SecureLend SDK client, but keep the original Error classes
jest.mock("@securelend/sdk", () => {
  const originalModule = jest.requireActual("@securelend/sdk");
  return {
    ...originalModule,
    SecureLend: jest.fn(),
  };
});
const SecureLendMock = SecureLend as jest.Mock;

describe("useDisplayOfferForm Hook", () => {
  let mockClient: {
    displayOfferForm: jest.Mock;
  };

  beforeEach(() => {
    mockClient = {
      displayOfferForm: jest.fn(),
    };
    SecureLendMock.mockImplementation(() => mockClient);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SecureLendProvider>{children}</SecureLendProvider>
  );

  it("should return correct initial state", () => {
    const { result } = renderHook(() => useDisplayOfferForm(), { wrapper });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.displayForm).toBe("function");
  });

  it("should handle a successful API call", async () => {
    const mockOffer = {
      offerId: "offer-123",
      lender: { id: "lender-1", name: "Test Lender", type: "BANK" },
      product: { name: "Test Loan", type: "INSTALLMENT_LOAN" },
      terms: {
        amount: { amount: 10000, currency: "USD" },
        interestRate: { type: "fixed", apr: 0.05 },
        termMonths: 12,
        payment: { amount: { amount: 856.07, currency: "USD" } },
      },
    };

    const mockResponse = {
      offer: mockOffer,
      allOffers: [mockOffer],
      applicationData: {},
      productType: "INSTALLMENT_LOAN",
    };
    mockClient.displayOfferForm.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useDisplayOfferForm(), { wrapper });

    await act(async () => {
      await result.current.displayForm({ offerId: "123" });
    });

    expect(mockClient.displayOfferForm).toHaveBeenCalledWith({
      offerId: "123",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  it("should handle a SecureLendError and re-throw", async () => {
    const mockError = new SecureLendError("API Error", "test_error");
    mockClient.displayOfferForm.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDisplayOfferForm(), { wrapper });

    await expect(
      act(async () => {
        await result.current.displayForm({ offerId: "123" });
      }),
    ).rejects.toThrow(mockError);

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(mockError);
  });

  it("should handle a generic Error and re-throw", async () => {
    const mockError = new Error("Generic network error");
    mockClient.displayOfferForm.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDisplayOfferForm(), { wrapper });

    await expect(
      act(async () => {
        await result.current.displayForm({ offerId: "123" });
      }),
    ).rejects.toThrow(mockError);

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(SecureLendError);
    expect(result.current.error?.message).toBe("Generic network error");
    expect(result.current.error?.type).toBe("unknown_error");
  });

  it("should set loading state correctly during API call", async () => {
    const mockOffer = {
      offerId: "offer-123",
      lender: { id: "lender-1", name: "Test Lender", type: "BANK" },
      product: { name: "Test Loan", type: "INSTALLMENT_LOAN" },
      terms: {
        amount: { amount: 10000, currency: "USD" },
        interestRate: { type: "fixed", apr: 0.05 },
        termMonths: 12,
        payment: { amount: { amount: 856.07, currency: "USD" } },
      },
    };
    const mockResponse = {
      offer: mockOffer,
      allOffers: [mockOffer],
      applicationData: {},
      productType: "INSTALLMENT_LOAN",
    };

    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockClient.displayOfferForm.mockReturnValue(promise);

    const { result } = renderHook(() => useDisplayOfferForm(), { wrapper });

    let displayPromise: Promise<any>;
    act(() => {
      displayPromise = result.current.displayForm({
        offerId: "123",
      });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise(mockResponse);
      await displayPromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
  });
});
