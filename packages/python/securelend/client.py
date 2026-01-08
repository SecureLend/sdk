import re
from typing import Optional

from .utils.mcp import MCPClient
from .resources.loans import Loans
from .resources.banking import Banking
from .resources.credit_cards import CreditCards
from .types import SecureLendConfig


class SecureLend:
    """
    SecureLend MCP-native SDK Client

    Example:
        >>> import asyncio
        >>> from securelend import SecureLend
        >>>
        >>> async def main():
        ...     securelend = SecureLend(api_key="sk_test_...")
        ...     loans = await securelend.loans.compare({
        ...         "amount": 200000,
        ...         "purpose": "equipment",
        ...         "business": { "revenue": 1200000, "creditScore": 720, "timeInBusiness": 36 }
        ...     })
        ...     print(loans)
    """

    def __init__(self, api_key: str, config: Optional[SecureLendConfig] = None):
        if not api_key or not re.match(r"^sk_(test|live)_[a-zA-Z0-9]{32,}$", api_key):
            raise ValueError("Invalid API key format. Expected: sk_test_... or sk_live_...")

        config = config or {}
        mcp_url = config.get("mcpURL", "https://mcp.securelend.ai/sse")

        self.mcp_client = MCPClient(api_key=api_key, mcp_url=mcp_url)

        # Initialize resource modules
        self.loans = Loans(self.mcp_client)
        self.banking = Banking(self.mcp_client)
        self.credit_cards = CreditCards(self.mcp_client)

    async def connect(self) -> None:
        """Manually connect to the MCP server."""
        await self.mcp_client.connect()

    def set_api_key(self, api_key: str) -> None:
        """Update API key for multi-tenant applications."""
        self.mcp_client.set_api_key(api_key)

    def enable_debug(self) -> None:
        """Enable debug logging."""
        self.mcp_client.enable_debug()

    def disable_debug(self) -> None:
        """Disable debug logging."""
        self.mcp_client.disable_debug()
