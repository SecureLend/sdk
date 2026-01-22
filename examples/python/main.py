import asyncio
import os
from securelend import SecureLend, SecureLendError

async def main():
    print("Running SecureLend SDK Python example...")

    # The API server is public and does not require an API key.
    # A key can optionally be provided for usage tracking.
    try:
        async with SecureLend(api_key=os.environ.get("SECURELEND_API_KEY")) as securelend:
            response = await securelend.compare_business_loans({
                "loanAmount": 50000,
                "purpose": "working_capital",
                "annualRevenue": 300000,
                "industry": "restaurant",
                "state": "CA",
            })

            print(f"Found {response.summary.total_offers} loan offers.")

            if response.offers:
                print("Top offer:")
                top_offer = response.offers[0]
                print(f"  - Lender: {top_offer.lender.name}")
                print(f"  - Product: {top_offer.product.name}")
                # APR is a value like 0.05, so multiply by 100 for percentage
                apr = top_offer.terms.interest_rate.apr * 100
                print(f"  - APR: {apr:.2f}%")
                print(f"  - Term: {top_offer.terms.term_months} months")

    except SecureLendError as e:
        print(f"A SecureLend error occurred: Type={e.type}, Message='{e}'")
        if e.details:
            print(f"Details: {e.details}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
