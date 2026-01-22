module.exports = {
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
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@modelcontextprotocol|pkce-challenge)/)',
  ],
};
