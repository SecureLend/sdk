# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-beta.0] - 2026-10-14

### Added
- REST methods for the place-to-underwrite loop: leads, matches, packages, consents, outcomes, credit box, feedback, and liquidity. `matches.list` calls compare only for a catalog loan product that has an amount. Factoring and other products return the lead's own lenders.
- `FeatureDisabledError` when a flag-gated route returns 404.
- Webhook verify and parse. `outcomes.signPayload()` signs the lender-outcome header the platform already checks.
- Python parity for outcomes, credit box, feedback, and webhooks.
- Optional React hooks: `useLead`, `useLeadOutcomes`, `useShareConsent`.

### Changed
- Comparison methods still call `https://mcp.securelend.ai/mcp`. The REST base defaults to `https://securelend.ai`. Comparison calls are not sent to `/v1/lender/mcp`.

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
