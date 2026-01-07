/**
 * Error classes for SecureLend SDK
 */

/**
 * Base error class for all SecureLend SDK errors
 */
export class SecureLendError extends Error {
  public readonly type: string;
  public readonly details?: any;

  constructor(message: string, type: string, details?: any) {
    super(message);
    this.name = "SecureLendError";
    this.type = type;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication error (invalid API key, etc.)
 */
export class AuthenticationError extends SecureLendError {
  constructor(message: string) {
    super(message, "authentication_error");
    this.name = "AuthenticationError";
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends SecureLendError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, "rate_limit_error");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Validation error (invalid request parameters)
 */
export class ValidationError extends SecureLendError {
  constructor(message: string, errors?: any) {
    super(message, "validation_error", errors);
    this.name = "ValidationError";
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends SecureLendError {
  constructor(message: string) {
    super(message, "not_found");
    this.name = "NotFoundError";
  }
}

/**
 * Network error
 */
export class NetworkError extends SecureLendError {
  constructor(message: string) {
    super(message, "network_error");
    this.name = "NetworkError";
  }
}

/**
 * Server error (5xx)
 */
export class ServerError extends SecureLendError {
  constructor(message: string) {
    super(message, "server_error");
    this.name = "ServerError";
  }
}
