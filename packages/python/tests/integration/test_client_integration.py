import os
import pytest
from securelend import SecureLend, SecureLendError, types


@pytest.mark.integration
@pytest.mark.asyncio
async def test_successful_connection_and_tool_call():
    """
    Tests that the client can connect to the production MCP server
    and make a simple, valid tool call.
    """
    api_key = os.environ.get("SECURELEND_API_KEY")
    client = SecureLend(api_key=api_key)

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
async def test_authentication_error():
    """
    Tests that the client receives an authentication error with an invalid API key.
    """
    client = SecureLend(api_key="invalid-key")
    with pytest.raises(SecureLendError) as excinfo:
        await client.compare_business_loans(
            {"loanAmount": 10000, "purpose": "working_capital"}
        )
    assert excinfo.value.type == "authentication_error"
