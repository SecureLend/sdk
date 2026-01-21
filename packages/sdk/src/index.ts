/**
 * SecureLend SDK
 *
 * Official SDK for SecureLend - Financial services infrastructure for AI
 *
 * @packageDocumentation
 */

export { SecureLend } from "./client";
export { SecureLend as default } from "./client";

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
export const VERSION = "0.1.0-beta.1";
