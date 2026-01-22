import {
  SecureLendError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
  ServerError,
} from "../../src/utils/errors";

describe("Error Classes", () => {
  it("SecureLendError should set properties correctly", () => {
    const error = new SecureLendError("message", "test_type", {
      detail: "info",
    });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("SecureLendError");
    expect(error.message).toBe("message");
    expect(error.type).toBe("test_type");
    expect(error.details).toEqual({ detail: "info" });
  });

  it("AuthenticationError should set properties correctly", () => {
    const error = new AuthenticationError("auth failed");
    expect(error).toBeInstanceOf(SecureLendError);
    expect(error.name).toBe("AuthenticationError");
    expect(error.message).toBe("auth failed");
    expect(error.type).toBe("authentication_error");
  });

  it("RateLimitError should set properties correctly", () => {
    const error = new RateLimitError("rate limited", 60);
    expect(error).toBeInstanceOf(SecureLendError);
    expect(error.name).toBe("RateLimitError");
    expect(error.message).toBe("rate limited");
    expect(error.type).toBe("rate_limit_error");
    expect(error.retryAfter).toBe(60);
  });

  it("ValidationError should set properties correctly", () => {
    const validationIssues = [{ path: "field", message: "required" }];
    const error = new ValidationError("invalid input", validationIssues);
    expect(error).toBeInstanceOf(SecureLendError);
    expect(error.name).toBe("ValidationError");
    expect(error.message).toBe("invalid input");
    expect(error.type).toBe("validation_error");
    expect(error.details).toBe(validationIssues);
  });

  it("NotFoundError should set properties correctly", () => {
    const error = new NotFoundError("not found");
    expect(error).toBeInstanceOf(SecureLendError);
    expect(error.name).toBe("NotFoundError");
    expect(error.message).toBe("not found");
    expect(error.type).toBe("not_found");
  });

  it("NetworkError should set properties correctly", () => {
    const error = new NetworkError("network issue");
    expect(error).toBeInstanceOf(SecureLendError);
    expect(error.name).toBe("NetworkError");
    expect(error.message).toBe("network issue");
    expect(error.type).toBe("network_error");
  });

  it("ServerError should set properties correctly", () => {
    const error = new ServerError("server issue");
    expect(error).toBeInstanceOf(SecureLendError);
    expect(error.name).toBe("ServerError");
    expect(error.message).toBe("server issue");
    expect(error.type).toBe("server_error");
  });
});
