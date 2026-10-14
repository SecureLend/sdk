/**
 * Error classes for SecureLend SDK
 */

/**
 * Base error class for all SecureLend SDK errors
 */
export class SecureLendError extends Error {
  public readonly type: string;
  public readonly details?: unknown;

  constructor(message: string, type: string, details?: unknown) {
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
  constructor(message: string, errors?: unknown) {
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

/**
 * A flag-gated route returned 404. The feature is off for this workspace.
 */
export class FeatureDisabledError extends SecureLendError {
  constructor(
    message = "This feature is off for this workspace.",
    details?: unknown,
  ) {
    super(message, "feature_disabled", details);
    this.name = "FeatureDisabledError";
  }
}

/**
 * A lender read needs a live consent for that package version.
 */
export class ConsentRequiredError extends SecureLendError {
  constructor(
    message = "A live consent is required before this package can be read.",
    details?: unknown,
  ) {
    super(message, "consent_required", details);
    this.name = "ConsentRequiredError";
  }
}

/**
 * The outcome cannot move from the current state to the requested state.
 */
export class InvalidTransitionError extends SecureLendError {
  constructor(message = "That outcome is not available.", details?: unknown) {
    super(message, "invalid_transition", details);
    this.name = "InvalidTransitionError";
  }
}

/**
 * A webhook signature was missing, expired, or did not match the body.
 */
export class WebhookSignatureError extends SecureLendError {
  constructor(message = "Webhook signature did not match.", details?: unknown) {
    super(message, "webhook_signature", details);
    this.name = "WebhookSignatureError";
  }
}
