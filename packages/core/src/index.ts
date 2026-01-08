/**
 * SecureLend SDK
 *
 * Official SDK for SecureLend - Financial services infrastructure for AI
 *
 * @packageDocumentation
 */

export { SecureLend } from "./client";
export { SecureLend as default } from "./client";

// Resource exports
export { Loans } from "./resources/loans";
export { Banking } from "./resources/banking";
export { CreditCards } from "./resources/credit-cards";

// Type exports
export * from "./types";

// Error exports
export {
  SecureLendError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
  ServerError,
} from "./utils/errors";

// Version
export const VERSION = "1.0.0";
