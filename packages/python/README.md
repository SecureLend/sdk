# SecureLend SDK for Python [![PyPI version](https://img.shields.io/pypi/v/securelend.svg)](https://pypi.org/project/securelend/)

The official Python SDK for SecureLend - Financial services infrastructure for AI assistants.

## Installation

```bash
pip install securelend
```

## Quick Start

```python
import asyncio
import os
from securelend import SecureLend

async def main():
    # The API server is public and does not require an API key.
    # A key can optionally be provided for usage tracking.
    async with SecureLend(api_key=os.environ.get("SECURELEND_API_KEY")) as securelend:
        response = await securelend.compare_business_loans({
            "loanAmount": 200000,
            "purpose": "equipment",
            "annualRevenue": 1200000,
        })

        print(f"Found {response.summary.total_offers} loan offers.")

        if response.offers:
            top_offer = response.offers[0]
            apr = top_offer.terms.interest_rate.apr * 100
            print(f"Top offer from {top_offer.lender.name} with {apr:.2f}% APR.")

            # Calculate payment details for the top offer
            payment_details = await securelend.calculate_loan_payment({
                "loanAmount": top_offer.terms.amount.amount,
                "interestRate": apr,
                "loanTermInMonths": top_offer.terms.term_months,
            })
            print(f"  - Estimated Monthly Payment: ${payment_details.monthly_payment:,.2f}")


if __name__ == "__main__":
    asyncio.run(main())
```

## Documentation

- [Full Documentation](https://docs.securelend.ai)
- [API Reference](https://docs.securelend.ai/api)
- [Guides](https://docs.securelend.ai/guides)
