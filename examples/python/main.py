import asyncio
import os
import sys

# Add the local `securelend` package to the Python path to ensure it can be found.
package_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../packages/python'))
if package_path not in sys.path:
    sys.path.insert(0, package_path)

from securelend import SecureLend, SecureLendError

async def main():
    print("Running SecureLend SDK Python example...")

    # Create a new client. The API key is optional but recommended for production.
    securelend = SecureLend(api_key=os.environ.get("SECURELEND_API_KEY"))

    try:
        response = await securelend.compare_business_loans({
            "loanAmount": 50000,
            "purpose": "working_capital",
            "annualRevenue": 300000,
            "industry": "restaurant",
            "state": "CA",
        })

        print(f"Found {response.summary['totalOffers']} loan offers.")

        if response.offers:
            print("Top offer:")
            top_offer = response.offers[0]
            print(f"  - Lender: {top_offer.lender['name']}")
            print(f"  - Product: {top_offer.product['name']}")
            # APR is a value like 0.05, so multiply by 100 for percentage
            apr = top_offer.terms['interestRate']['apr'] * 100
            print(f"  - APR: {apr:.2f}%")
            print(f"  - Term: {top_offer.terms['termMonths']} months")

    except SecureLendError as e:
        print(f"A SecureLend error occurred: Type={e.type}, Message='{e}'")
        if e.details:
            print(f"Details: {e.details}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
