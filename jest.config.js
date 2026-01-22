module.exports = {
  projects: ["packages/sdk", "examples/nextjs-app", "examples/nodejs"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "lcov", "clover"],
};
