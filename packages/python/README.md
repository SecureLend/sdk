# SecureLend SDK for Python

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
    # The API key is optional but recommended.
    # It's best to load it from a secure source, like environment variables.
    securelend = SecureLend(api_key=os.environ.get("SECURELEND_API_KEY"))

    response = await securelend.compare_business_loans({
        "loanAmount": 200000,
        "purpose": "equipment",
        "annualRevenue": 1200000,
    })

    print(f"Found {response['summary']['totalOffers']} loan offers.")

    if response["offers"]:
        top_offer = response["offers"][0]
        apr = top_offer['terms']['interestRate']['apr'] * 100
        print(f"Top offer from {top_offer['lender']['name']} with {apr:.2f}% APR")


if __name__ == "__main__":
    asyncio.run(main())
```

## Documentation

- [Full Documentation](https://docs.securelend.ai)
- [API Reference](https://docs.securelend.ai/api)
- [Guides](https://docs.securelend.ai/guides)
