/// <reference types="@testing-library/jest-dom" />
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { SecureLendProvider } from "../../src/contexts/SecureLendProvider";
import { useSubmitApplication } from "../../src/hooks/useSubmitApplication";
import {
  SecureLend,
  SecureLendError,
  ProductType,
  ApplicationType,
  ApplicationStatus,
} from "@securelend/sdk";

// Mock the SecureLend SDK client, but keep the original Error classes
jest.mock("@securelend/sdk", () => {
  const originalModule = jest.requireActual("@securelend/sdk");
  return {
    ...originalModule,
    SecureLend: jest.fn(),
  };
});
const SecureLendMock = SecureLend as jest.Mock;

describe("useSubmitApplication Hook", () => {
  let mockClient: {
    getOffer: jest.Mock;
    getMultipleOffers: jest.Mock;
  };

  const mockApplicant = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  };

  const mockProvider = {
    providerId: "provider-1",
    providerName: "Test Bank",
  };

  const mockResponse = {
    id: "app-123",
    createdAt: "2023-01-01T12:00:00Z",
    updatedAt: "2023-01-01T12:00:00Z",
    applicationType: ApplicationType.PERSONAL,
    productType: ProductType.INSTALLMENT_LOAN,
    status: ApplicationStatus.DRAFT,
    applicant: mockApplicant,
    applicationData: {},
    providers: [],
    email: "john.doe@example.com",
  };

  beforeEach(() => {
    mockClient = {
      getOffer: jest.fn(),
      getMultipleOffers: jest.fn(),
    };
    SecureLendMock.mockImplementation(() => mockClient);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SecureLendProvider>{children}</SecureLendProvider>
  );

  it("should return correct initial state", () => {
    const { result } = renderHook(() => useSubmitApplication(), { wrapper });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.submitOffer).toBe("function");
    expect(typeof result.current.submitMultipleOffers).toBe("function");
  });

  describe("submitOffer", () => {
    const request = {
      productType: ProductType.INSTALLMENT_LOAN,
      applicant: mockApplicant,
      applicationData: {},
      provider: mockProvider,
    };

    it("should handle a successful API call", async () => {
      mockClient.getOffer.mockResolvedValue(mockResponse);
      const { result } = renderHook(() => useSubmitApplication(), { wrapper });

      await act(async () => {
        await result.current.submitOffer(request);
      });

      expect(mockClient.getOffer).toHaveBeenCalledWith(request);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it("should handle a SecureLendError and re-throw", async () => {
      const mockError = new SecureLendError("API Error", "test_error");
      mockClient.getOffer.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSubmitApplication(), { wrapper });

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.submitOffer(request);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(mockError);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(mockError);
    });

    it("should handle a generic Error and re-throw", async () => {
      const mockError = new Error("Generic network error");
      mockClient.getOffer.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSubmitApplication(), { wrapper });

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.submitOffer(request);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(mockError);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(SecureLendError);
      expect(result.current.error?.message).toBe("Generic network error");
      expect(result.current.error?.type).toBe("unknown_error");
    });

    it("should set loading state correctly during API call", async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockClient.getOffer.mockReturnValue(promise);

      const { result } = renderHook(() => useSubmitApplication(), { wrapper });

      let submitPromise: Promise<any>;
      act(() => {
        submitPromise = result.current.submitOffer(request);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise(mockResponse);
        try {
          await submitPromise;
        } catch (e) {
          // ignore
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe("submitMultipleOffers", () => {
    const request = {
      productType: ProductType.INSTALLMENT_LOAN,
      applicant: mockApplicant,
      applicationData: {},
      providers: [mockProvider],
    };

    it("should handle a successful API call", async () => {
      mockClient.getMultipleOffers.mockResolvedValue(mockResponse);
      const { result } = renderHook(() => useSubmitApplication(), { wrapper });

      await act(async () => {
        await result.current.submitMultipleOffers(request);
      });

      expect(mockClient.getMultipleOffers).toHaveBeenCalledWith(request);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it("should handle a SecureLendError and re-throw", async () => {
      const mockError = new SecureLendError("API Error", "test_error");
      mockClient.getMultipleOffers.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSubmitApplication(), { wrapper });

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.submitMultipleOffers(request);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(mockError);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(mockError);
    });

    it("should handle a generic Error and re-throw", async () => {
      const mockError = new Error("Generic network error");
      mockClient.getMultipleOffers.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSubmitApplication(), { wrapper });

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.submitMultipleOffers(request);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(mockError);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(SecureLendError);
      expect(result.current.error?.message).toBe("Generic network error");
      expect(result.current.error?.type).toBe("unknown_error");
    });

    it("should set loading state correctly during API call", async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockClient.getMultipleOffers.mockReturnValue(promise);

      const { result } = renderHook(() => useSubmitApplication(), { wrapper });

      let submitPromise: Promise<any>;
      act(() => {
        submitPromise = result.current.submitMultipleOffers(request);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise(mockResponse);
        try {
          await submitPromise;
        } catch (e) {
          // ignore
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
    });
  });
});
