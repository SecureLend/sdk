# Contributing to SecureLend SDK

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and professional. We're building financial infrastructure.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/SecureLend/sdk/issues)
2. Use the bug report template
3. Include:
   - SDK version
   - Environment (Node version, OS)
   - Minimal reproduction code
   - Expected vs actual behavior
   - Error messages/stack traces

### Suggesting Features

1. Check existing feature requests
2. Explain the use case
3. Describe expected behavior
4. Consider backward compatibility

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Write tests for your changes
4. Ensure all tests pass: `npm test`
5. Update documentation
6. Commit with clear messages: `git commit -m 'Add amazing feature'`
7. Push to your fork: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Development Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/sdk.git
cd sdk

# Add upstream remote
git remote add upstream https://github.com/SecureLend/sdk.git

# Install dependencies
npm install

# Build packages
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## Project Structure
```
sdk/
├── packages/
│   ├── core/          # @securelend/sdk - Main SDK
│   ├── react/         # @securelend/react - React hooks
│   └── python/        # securelend-python - Python SDK
├── integrations/
│   ├── langchain/     # LangChain integration
│   └── vercel-ai/     # Vercel AI SDK integration
├── examples/          # Example applications
└── docs/              # Documentation
```

## Testing
```bash
# Run all tests
npm test

# Run specific package tests
npm test -w @securelend/sdk

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Code Style

- Use TypeScript for all code
- Follow ESLint rules: `npm run lint`
- Format with Prettier: `npm run format`
- Write JSDoc comments for public APIs
- Add types for all function parameters

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to public methods
- Update TypeScript type definitions
- Add examples for new features
- Update CHANGELOG.md

## Pull Request Process

1. Update CHANGELOG.md with changes
2. Ensure CI passes (tests, linting, types)
3. Get approval from maintainer
4. Squash commits before merge

## Release Process

Releases are handled by maintainers:

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to npm
5. Create GitHub release

## Questions?

- Open a [GitHub Discussion](https://github.com/SecureLend/sdk/discussions)
- Join our [Discord](https://discord.gg/securelend)
- Email: [developers@securelend.ai](mailto:developers@securelend.ai)
