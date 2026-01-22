import pytest
from unittest.mock import patch, AsyncMock

from securelend import SecureLend, types, ValidationError


@pytest.fixture
def mock_mcp_client():
    """Fixture to mock the MCPClient."""
    with patch("securelend.client.MCPClient", autospec=True) as mock_mcp_client_class:
        mock_instance = mock_mcp_client_class.return_value
        mock_instance.call_tool = AsyncMock()
        mock_instance.connect = AsyncMock()
        yield mock_instance


def test_constructor_and_configuration(mock_mcp_client):
    """Test client initialization with default and custom configurations."""
    # Test with default config
    SecureLend()
    from securelend.client import MCPClient

    MCPClient.assert_called_with(api_key="", mcp_url="https://mcp.securelend.ai/mcp")

    # Test with custom config
    SecureLend(api_key="sk_test_123", server_url="https://custom.mcp.com/mcp")
    MCPClient.assert_called_with(
        api_key="sk_test_123", mcp_url="https://custom.mcp.com/mcp"
    )


@pytest.mark.asyncio
async def test_compare_business_loans(mock_mcp_client):
    """Test a tool-calling method to ensure it calls MCPClient correctly."""
    client = SecureLend()

    mock_mcp_client.call_tool.return_value = {
        "content": [
            {
                "type": "text",
                "text": '{"offers": [], "summary": {"totalOffers": 0}, "metadata": {}}',
            }
        ]
    }

    request_data = {
        "loanAmount": 50000,
        "purpose": "working_capital",
    }

    response = await client.compare_business_loans(request_data)

    mock_mcp_client.call_tool.assert_called_once_with(
        "compare_business_loans", request_data
    )
    assert isinstance(response, types.LoanComparisonResponse)
    assert response.summary["totalOffers"] == 0


@pytest.mark.asyncio
async def test_input_validation_failure(mock_mcp_client):
    """Test that invalid input to a tool-calling method raises a ValidationError."""
    client = SecureLend()
    with pytest.raises(ValidationError):
        await client.compare_business_loans({"purpose": "working_capital"})


@pytest.mark.asyncio
async def test_core_methods(mock_mcp_client):
    """Test core client methods like connect, debug, and set_api_key."""
    client = SecureLend()

    # Test connect
    await client.connect()
    mock_mcp_client.connect.assert_called_once()

    # Test enableDebug
    client.enable_debug()
    mock_mcp_client.enable_debug.assert_called_once()

    # Test disableDebug
    client.disable_debug()
    mock_mcp_client.disable_debug.assert_called_once()

    # Test setApiKey
    client.set_api_key("new_key")
    mock_mcp_client.set_api_key.assert_called_once_with("new_key")
