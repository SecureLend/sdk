/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { SecureLendWidget } from "../../src/components/SecureLendWidget";

describe("SecureLendWidget Component", () => {
  it("should render the provided HTML content", () => {
    const html = "<h1>Test Heading</h1><p>Some content</p>";
    render(<SecureLendWidget html={html} />);
    expect(screen.getByText("Test Heading")).toBeInTheDocument();
    expect(screen.getByText("Some content")).toBeInTheDocument();
  });

  it("should apply the default className when none is provided", () => {
    const html = "<div></div>";
    const { container } = render(<SecureLendWidget html={html} />);
    expect(container.firstChild).toHaveClass("securelend-widget");
  });

  it("should apply the provided className", () => {
    const html = "<div></div>";
    const { container } = render(
      <SecureLendWidget html={html} className="custom-widget-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-widget-class");
  });

  it("should render an empty div if html is an empty string", () => {
    const { container } = render(<SecureLendWidget html="" />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
