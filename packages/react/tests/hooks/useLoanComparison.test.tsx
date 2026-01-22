/// <reference types="@testing-library/jest-dom" />
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { SecureLendProvider } from "../../src/contexts/SecureLendProvider";
import { useLoanComparison } from "../../src/hooks/useLoanComparison";
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

describe("useLoanComparison Hook", () => {
  let mockClient: {
    compareBusinessLoans: jest.Mock;
  };

  beforeEach(() => {
    mockClient = {
      compareBusinessLoans: jest.fn(),
    };
    SecureLendMock.mockImplementation(() => mockClient);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SecureLendProvider>{children}</SecureLendProvider>
  );

  it("should return correct initial state", () => {
    const { result } = renderHook(() => useLoanComparison(), { wrapper });

    expect(result.current.data).toBeNull();
    expect(result.current.widget).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.compare).toBe("function");
  });

  it("should handle a successful API call", async () => {
    const mockResponse = {
      offers: [],
      summary: { totalOffers: 0, bestRate: 0 },
      metadata: { queryId: "123", timestamp: "" },
      widget: "<div>widget</div>",
    };
    mockClient.compareBusinessLoans.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLoanComparison(), { wrapper });

    await act(async () => {
      await result.current.compare({ loanAmount: 10000, purpose: "test" });
    });

    expect(mockClient.compareBusinessLoans).toHaveBeenCalledWith({
      loanAmount: 10000,
      purpose: "test",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.widget).toBe("<div>widget</div>");
    expect(result.current.error).toBeNull();
  });

  it("should handle a successful API call without a widget", async () => {
    const mockResponse = {
      offers: [],
      summary: { totalOffers: 0, bestRate: 0 },
      metadata: { queryId: "123", timestamp: "" },
    };
    mockClient.compareBusinessLoans.mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useLoanComparison(), { wrapper });
    await act(async () => {
      await result.current.compare({ loanAmount: 10000, purpose: "test" });
    });
    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.widget).toBeNull();
  });

  it("should handle a SecureLendError during API call", async () => {
    const mockError = new SecureLendError("API Error", "test_error");
    mockClient.compareBusinessLoans.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLoanComparison(), { wrapper });

    await act(async () => {
      await result.current.compare({ loanAmount: 10000, purpose: "test" });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.widget).toBeNull();
    expect(result.current.error).toBe(mockError);
  });

  it("should handle a generic Error during API call", async () => {
    const mockError = new Error("Generic network error");
    mockClient.compareBusinessLoans.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLoanComparison(), { wrapper });

    await act(async () => {
      await result.current.compare({ loanAmount: 10000, purpose: "test" });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.widget).toBeNull();
    expect(result.current.error).toBeInstanceOf(SecureLendError);
    expect(result.current.error?.message).toBe("Generic network error");
    expect(result.current.error?.type).toBe("unknown_error");
  });

  it("should set loading state correctly during API call", async () => {
    const mockResponse = {
      offers: [],
      summary: { totalOffers: 0, bestRate: 0 },
      metadata: { queryId: "123", timestamp: "" },
    };

    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockClient.compareBusinessLoans.mockReturnValue(promise);

    const { result } = renderHook(() => useLoanComparison(), { wrapper });

    let comparePromise: Promise<void>;
    act(() => {
      comparePromise = result.current.compare({
        loanAmount: 10000,
        purpose: "test",
      });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise(mockResponse);
      await comparePromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
  });
});
