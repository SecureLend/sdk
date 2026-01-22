module.exports = {
  // This configuration will run tests for the library packages (`sdk`, `react`, etc.)
  // and generate a unified coverage report. Example apps are tested separately
  // via `npm test` which uses their own configs.
  preset: "ts-jest",
  testEnvironment: "jsdom",
  clearMocks: true,
  collectCoverageFrom: [
    "packages/*/src/**/*.{ts,tsx}",
    // Exclude type definition files
    "!**/*.d.ts",
    // Exclude the index files which just export from other files
    "!packages/*/src/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "lcov", "clover"],
  roots: ["<rootDir>/packages"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "<rootDir>/packages/python"],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          allowJs: true,
        },
      },
    ],
  },
  transformIgnorePatterns: [
    // Transform ESM modules from these packages
    '/node_modules/(?!(@modelcontextprotocol|pkce-challenge)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
