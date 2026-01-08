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
    securelend = SecureLend(api_key=os.environ.get("SECURELEND_API_KEY"))

    loans = await securelend.loans.compare({
        "amount": 200000,
        "purpose": "equipment",
        "business": {
            "revenue": 1200000,
            "creditScore": 720,
            "timeInBusiness": 36,
        },
    })

    print(f"Best rate: {loans['offers'][0]['terms']['interestRate']['rate']}%")

if __name__ == "__main__":
    asyncio.run(main())
```

## Documentation

- [Full Documentation](https://docs.securelend.ai)
- [API Reference](https://docs.securelend.ai/api)
- [Guides](https://docs.securelend.ai/guides)
