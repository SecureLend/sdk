import os
import pytest
from securelend import SecureLend, SecureLendError, types


@pytest.mark.integration
@pytest.mark.asyncio
async def test_successful_connection_with_api_key():
    """
    Tests that the client can connect to the production MCP server
    with an API key and make a simple, valid tool call.
    """
    # This test is useful for when API keys are enforced for rate-limiting, etc.
    api_key = os.environ.get("SECURELEND_API_KEY")
    async with SecureLend(api_key=api_key) as client:
        try:
            response = await client.compare_business_loans(
                {"loanAmount": 10000, "purpose": "working_capital"}
            )
            assert isinstance(response, types.LoanComparisonResponse)
            assert response.metadata.query_id is not None
        except SecureLendError as e:
            pytest.fail(f"API call failed with SecureLendError: {e}")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_successful_connection_without_api_key():
    """
    Tests that the client can connect to the production MCP server
    without an API key, since it's public.
    """
    async with SecureLend() as client:  # No API key
        try:
            response = await client.compare_business_loans(
                {"loanAmount": 10000, "purpose": "working_capital"}
            )
            assert isinstance(response, types.LoanComparisonResponse)
            assert response.metadata.query_id is not None
        except SecureLendError as e:
            pytest.fail(f"API call failed with SecureLendError: {e}")
