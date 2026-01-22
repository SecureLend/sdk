import json
from typing import Any, Dict, Optional, Type, TypeVar

from pydantic import BaseModel, ValidationError as PydanticValidationError

from . import types
from .utils.errors import SecureLendError, ValidationError
from .utils.mcp import MCPClient

T = TypeVar("T", bound=BaseModel)


class SecureLend:
    """
    SecureLend MCP-native SDK Client

    Example:
        >>> import asyncio
        >>> from securelend import SecureLend
        >>>
        >>> async def main():
        ...     securelend = SecureLend(api_key="sk_test_...")
        ...     loans = await securelend.compare_business_loans({
        ...         "loanAmount": 200000,
        ...         "purpose": "equipment",
        ...         "annualRevenue": 1200000,
        ...     })
        ...     print(loans)
    """

    def __init__(
        self, *, api_key: Optional[str] = None, server_url: Optional[str] = None
    ):
        mcp_url = server_url or "https://mcp.securelend.ai/mcp"
        self._mcp_client = MCPClient(api_key=api_key or "", mcp_url=mcp_url)

    # --- Loan Comparison ---

    async def compare_personal_loans(
        self, request: types.PersonalLoanSearchParams
    ) -> types.LoanComparisonResponse:
        return await self._call_tool("compare_personal_loans", request, types.LoanComparisonResponse)

    async def compare_business_loans(
        self, request: types.BusinessLoanSearchParams
    ) -> types.LoanComparisonResponse:
        return await self._call_tool("compare_business_loans", request, types.LoanComparisonResponse)

    async def compare_personal_mortgages(
        self, request: types.MortgageSearchParams
    ) -> types.LoanComparisonResponse:
        return await self._call_tool(
            "compare_personal_mortgages", request, types.LoanComparisonResponse
        )

    async def compare_business_mortgages(
        self, request: types.MortgageSearchParams
    ) -> types.LoanComparisonResponse:
        return await self._call_tool(
            "compare_business_mortgages", request, types.LoanComparisonResponse
        )

    async def compare_car_loans(
        self, request: types.AutoLoanSearchParams
    ) -> types.LoanComparisonResponse:
        return await self._call_tool("compare_car_loans", request, types.LoanComparisonResponse)

    async def compare_student_loans(
        self, request: types.StudentLoanSearchParams
    ) -> types.LoanComparisonResponse:
        return await self._call_tool("compare_student_loans", request, types.LoanComparisonResponse)

    # --- Banking & Credit Cards ---

    async def compare_business_banking(
        self, request: types.BusinessBankingSearchSchema
    ) -> types.BusinessBankingComparisonResponse:
        return await self._call_tool(
            "compare_business_banking", request, types.BusinessBankingComparisonResponse
        )

    async def compare_personal_banking(
        self, request: types.PersonalBankingSearchSchema
    ) -> types.PersonalBankingComparisonResponse:
        return await self._call_tool(
            "compare_personal_banking", request, types.PersonalBankingComparisonResponse
        )

    async def compare_savings_accounts(
        self, request: types.SavingsSearchSchema
    ) -> types.SavingsAccountComparisonResponse:
        return await self._call_tool(
            "compare_savings_accounts", request, types.SavingsAccountComparisonResponse
        )

    async def compare_business_credit_cards(
        self, request: types.BusinessCreditCardSearchParams
    ) -> types.BusinessCreditCardComparisonResponse:
        return await self._call_tool(
            "compare_business_credit_cards",
            request,
            types.BusinessCreditCardComparisonResponse,
        )

    async def compare_personal_credit_cards(
        self, request: types.PersonalCreditCardSearchSchema
    ) -> types.PersonalCreditCardComparisonResponse:
        return await self._call_tool(
            "compare_personal_credit_cards",
            request,
            types.PersonalCreditCardComparisonResponse,
        )

    # --- Financial Calculators ---

    async def calculate_loan_payment(
        self, request: types.LoanPaymentParams
    ) -> types.LoanCalculationResponse:
        return await self._call_tool(
            "calculate_loan_payment", request, types.LoanCalculationResponse
        )

    async def calculate_mortgage_payment(
        self, request: types.MortgagePaymentParams
    ) -> types.MortgageCalculationResponse:
        return await self._call_tool(
            "calculate_mortgage_payment", request, types.MortgageCalculationResponse
        )

    async def compare_lease_vs_purchase(
        self, request: types.LeaseVsPurchaseParams
    ) -> types.LeaseVsPurchaseResponse:
        return await self._call_tool(
            "compare_lease_vs_purchase", request, types.LeaseVsPurchaseResponse
        )

    # --- Application Management ---

    async def get_offer(self, request: types.GetOfferParams) -> types.PersonalApplication:
        return await self._call_tool("get_offer", request, types.PersonalApplication)

    async def get_multiple_offers(
        self, request: types.GetMultipleOffersParams
    ) -> types.PersonalApplication:
        return await self._call_tool("get_multiple_offers", request, types.PersonalApplication)

    async def display_offer_form(
        self, request: types.DisplayOfferFormParams
    ) -> types.DisplayOfferFormResponse:
        return await self._call_tool("display_offer_form", request, types.DisplayOfferFormResponse)

    async def track_offer_status(
        self, request: types.TrackOfferStatusParams
    ) -> types.TrackOfferStatusResponse:
        return await self._call_tool("track_offer_status", request, types.TrackOfferStatusResponse)

    async def display_upload_documents_form(
        self, request: types.DisplayUploadDocumentsFormParams
    ) -> types.DisplayUploadDocumentsFormResponse:
        return await self._call_tool(
            "display_upload_documents_form",
            request,
            types.DisplayUploadDocumentsFormResponse,
        )

    async def submit_documents(
        self, request: types.SubmitDocumentsParams
    ) -> types.SubmitDocumentsResponse:
        return await self._call_tool("submit_documents", request, types.SubmitDocumentsResponse)

    # --- Core Methods ---

    async def connect(self) -> None:
        """Manually connect to the MCP server."""
        await self._mcp_client.connect()

    def set_api_key(self, api_key: str) -> None:
        """Update API key for multi-tenant applications."""
        self._mcp_client.set_api_key(api_key)

    def enable_debug(self) -> None:
        """Enable debug logging."""
        self._mcp_client.enable_debug()

    def disable_debug(self) -> None:
        """Disable debug logging."""
        self._mcp_client.disable_debug()

    # --- Private Helpers ---

    async def _call_tool(
        self, tool_name: str, request: Dict[str, Any], response_cls: Type[T]
    ) -> T:
        tool_result = await self._mcp_client.call_tool(tool_name, request)
        data = self._parse_json_response(tool_result)
        data["widget"] = self._get_widget(tool_result)

        try:
            # Pydantic automatically handles camelCase to snake_case if aliases are set
            return response_cls.model_validate(data)
        except PydanticValidationError as e:
            raise ValidationError(
                f"Invalid response from MCP server: failed to validate JSON content for tool '{tool_name}'",
                errors=e.errors(),
            ) from e

    def _parse_json_response(self, tool_result: types.ToolResult) -> Dict[str, Any]:
        content_list = tool_result.get("content", [])
        if not isinstance(content_list, list):
            raise SecureLendError(
                "Invalid response: content is not a list", "server_error"
            )

        for item in content_list:
            item_type = item.get("type")
            if item_type == "text":
                try:
                    return json.loads(item.get("text", "{}"))
                except json.JSONDecodeError as e:
                    raise SecureLendError(
                        f"Failed to parse JSON response: {e}", "server_error"
                    ) from e
            elif (
                item_type == "resource"
                and item.get("resource", {}).get("mimeType") == "application/json"
            ):
                try:
                    return json.loads(item.get("resource", {}).get("text", "{}"))
                except json.JSONDecodeError as e:
                    raise SecureLendError(
                        f"Failed to parse JSON response: {e}", "server_error"
                    ) from e

        raise SecureLendError(
            "Invalid response from MCP server: missing JSON content", "server_error"
        )

    def _get_widget(self, tool_result: types.ToolResult) -> Optional[str]:
        content_list = tool_result.get("content", [])
        if not isinstance(content_list, list):
            return None

        for item in content_list:
            if (
                item.get("type") == "resource"
                and item.get("resource", {}).get("mimeType") == "text/html"
            ):
                return item.get("resource", {}).get("text")
        return None
