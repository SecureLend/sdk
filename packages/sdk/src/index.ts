/**
 * SecureLend SDK
 *
 * Official SDK for SecureLend - Financial services infrastructure for AI
 *
 * @packageDocumentation
 */

export { SecureLend } from "./client";

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

// Version is managed in package.json
