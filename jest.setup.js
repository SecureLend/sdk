require('@testing-library/jest-dom');

// Polyfill Web APIs for JSDOM environment
const { TextEncoder, TextDecoder } = require('util');
const { TransformStream } = require('node:stream/web');

Object.assign(global, { TextEncoder, TextDecoder, TransformStream });
