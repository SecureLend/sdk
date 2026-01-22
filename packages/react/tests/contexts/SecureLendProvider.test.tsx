import { render, screen } from "@testing-library/react";
import React from "react";
import { SecureLendProvider } from "../../src/contexts/SecureLendProvider";
import { useSecureLend } from "../../src/hooks/useSecureLend";
import { SecureLend } from "@securelend/sdk";

// Mock the SecureLend SDK client
jest.mock("@securelend/sdk");
const SecureLendMock = SecureLend as jest.Mock;

describe("SecureLendProvider", () => {
  beforeEach(() => {
    SecureLendMock.mockClear();
  });

  // Test component that consumes the context
  const TestConsumer = () => {
    const client = useSecureLend();
    return <div>Client is {client ? "available" : "null"}</div>;
  };

  it("should render children", () => {
    render(
      <SecureLendProvider>
        <div>Test Child</div>
      </SecureLendProvider>,
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should provide a SecureLend client instance via context", () => {
    render(
      <SecureLendProvider>
        <TestConsumer />
      </SecureLendProvider>,
    );
    expect(screen.getByText("Client is available")).toBeInTheDocument();
    expect(SecureLendMock).toHaveBeenCalledTimes(1);
  });

  it("should pass config to the SecureLend client constructor", () => {
    const config = { apiKey: "test-key" };
    render(
      <SecureLendProvider config={config}>
        <TestConsumer />
      </SecureLendProvider>,
    );
    expect(SecureLendMock).toHaveBeenCalledWith(config);
  });

  it("should not recreate the client on re-render if config is stable", () => {
    const config = { apiKey: "test-key" };
    const { rerender } = render(
      <SecureLendProvider config={config}>
        <TestConsumer />
      </SecureLendProvider>,
    );
    expect(SecureLendMock).toHaveBeenCalledTimes(1);

    // Rerender with the same config object
    rerender(
      <SecureLendProvider config={config}>
        <TestConsumer />
      </SecureLendProvider>,
    );
    expect(SecureLendMock).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it("should recreate the client on re-render if config changes", () => {
    const initialConfig = { apiKey: "key1" };
    const { rerender } = render(
      <SecureLendProvider config={initialConfig}>
        <TestConsumer />
      </SecureLendProvider>,
    );
    expect(SecureLendMock).toHaveBeenCalledTimes(1);
    expect(SecureLendMock).toHaveBeenCalledWith(initialConfig);

    // Rerender with a new config object
    const newConfig = { apiKey: "key2" };
    rerender(
      <SecureLendProvider config={newConfig}>
        <TestConsumer />
      </SecureLendProvider>,
    );
    expect(SecureLendMock).toHaveBeenCalledTimes(2); // Should be called again
    expect(SecureLendMock).toHaveBeenCalledWith(newConfig);
  });
});
