# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **BREAKING**: Refactored `SecureLend` client to a flat API structure with methods for all 20 MCP tools.
- **BREAKING**: Removed resource-specific classes (`Loans`, `Banking`, `CreditCards`) and their corresponding files. The new API is now available directly on the `SecureLend` client instance.

### Added
- Added type definitions for all 20 MCP tools, including requests and responses for loans, mortgages, banking, credit cards, calculators, and application management.

## [1.0.0] - 2025-01-XX

### Added

- Initial public release of SecureLend SDK
- Full MCP schema compliance
- Production-ready client libraries
- Documentation and examples
