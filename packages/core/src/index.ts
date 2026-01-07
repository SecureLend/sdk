/**
 * SecureLend MCP-native SDK
 * 
 * Official SDK for SecureLend - Financial services infrastructure for AI
 * 
 * @packageDocumentation
 */

export { SecureLendMCP } from './client';
export { SecureLendMCP as default } from './client';

// Resource exports
export { Loans } from './resources/loans';
export { Banking } from './resources/banking';
export { CreditCards } from './resources/credit-cards';

// Type exports
export * from './types';

// Error exports
export {
  SecureLendError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
} from './utils/errors';

// Version
export const VERSION = '1.0.0';
