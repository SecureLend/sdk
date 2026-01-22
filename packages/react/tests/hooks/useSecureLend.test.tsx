import { renderHook } from "@testing-library/react";
import React from "react";
import { SecureLendContext } from "../../src/contexts/SecureLendProvider";
import { useSecureLend } from "../../src/hooks/useSecureLend";

describe("useSecureLend Hook", () => {
  it("should throw an error when used outside of a SecureLendProvider", () => {
    // Suppress console.error output from React for this test
    const originalError = console.error;
    console.error = jest.fn();

    const { result } = renderHook(() => useSecureLend());

    expect(result.error).toEqual(
      new Error("useSecureLend must be used within a SecureLendProvider"),
    );

    console.error = originalError;
  });

  it("should return the client when used inside of a SecureLendProvider", () => {
    const mockClient = { mock: "client" };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SecureLendContext.Provider value={{ client: mockClient as any }}>
        {children}
      </SecureLendContext.Provider>
    );

    const { result } = renderHook(() => useSecureLend(), { wrapper });

    expect(result.current).toBe(mockClient);
    expect(result.error).toBeUndefined();
  });
});
