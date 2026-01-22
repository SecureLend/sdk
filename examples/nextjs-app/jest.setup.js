// Polyfill Web APIs for JSDOM environment
import { TextEncoder, TextDecoder } from 'util';
import { TransformStream } from 'node:stream/web';

Object.assign(global, { TextEncoder, TextDecoder, TransformStream });

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for things like setting up DOM environment, mocking, etc.
import '@testing-library/jest-dom';
