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
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        try:
            validated_request = types.PersonalLoanSearchParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("compare_personal_loans", validated_request, types.LoanComparisonResponse)

    async def compare_business_loans(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        try:
            validated_request = types.BusinessLoanSearchParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("compare_business_loans", validated_request, types.LoanComparisonResponse)

    async def compare_personal_mortgages(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        try:
            validated_request = types.MortgageSearchParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "compare_personal_mortgages", validated_request, types.LoanComparisonResponse
        )

    async def compare_business_mortgages(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        try:
            validated_request = types.MortgageSearchParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "compare_business_mortgages", validated_request, types.LoanComparisonResponse
        )

    async def compare_car_loans(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        try:
            validated_request = types.AutoLoanSearchParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("compare_car_loans", validated_request, types.LoanComparisonResponse)

    async def compare_student_loans(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        try:
            validated_request = types.StudentLoanSearchParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("compare_student_loans", validated_request, types.LoanComparisonResponse)

    # --- Banking & Credit Cards ---

    async def compare_business_banking(
        self, request: Dict[str, Any]
    ) -> types.BusinessBankingComparisonResponse:
        try:
            validated_request = types.BusinessBankingSearchSchema.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "compare_business_banking", validated_request, types.BusinessBankingComparisonResponse
        )

    async def compare_personal_banking(
        self, request: Dict[str, Any]
    ) -> types.PersonalBankingComparisonResponse:
        try:
            validated_request = types.PersonalBankingSearchSchema.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "compare_personal_banking", validated_request, types.PersonalBankingComparisonResponse
        )

    async def compare_savings_accounts(
        self, request: Dict[str, Any]
    ) -> types.SavingsAccountComparisonResponse:
        try:
            validated_request = types.SavingsSearchSchema.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "compare_savings_accounts", validated_request, types.SavingsAccountComparisonResponse
        )

    async def compare_business_credit_cards(
        self, request: Dict[str, Any]
    ) -> types.BusinessCreditCardComparisonResponse:
        try:
            validated_request = types.BusinessCreditCardSearchParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "compare_business_credit_cards",
            validated_request,
            types.BusinessCreditCardComparisonResponse,
        )

    async def compare_personal_credit_cards(
        self, request: Dict[str, Any]
    ) -> types.PersonalCreditCardComparisonResponse:
        try:
            validated_request = types.PersonalCreditCardSearchSchema.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "compare_personal_credit_cards",
            validated_request,
            types.PersonalCreditCardComparisonResponse,
        )

    # --- Financial Calculators ---

    async def calculate_loan_payment(
        self, request: Dict[str, Any]
    ) -> types.LoanCalculationResponse:
        try:
            validated_request = types.LoanPaymentParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "calculate_loan_payment", validated_request, types.LoanCalculationResponse
        )

    async def calculate_mortgage_payment(
        self, request: Dict[str, Any]
    ) -> types.MortgageCalculationResponse:
        try:
            validated_request = types.MortgagePaymentParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "calculate_mortgage_payment", validated_request, types.MortgageCalculationResponse
        )

    async def compare_lease_vs_purchase(
        self, request: Dict[str, Any]
    ) -> types.LeaseVsPurchaseResponse:
        try:
            validated_request = types.LeaseVsPurchaseParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "compare_lease_vs_purchase", validated_request, types.LeaseVsPurchaseResponse
        )

    # --- Application Management ---

    async def get_offer(self, request: Dict[str, Any]) -> types.PersonalApplication:
        try:
            validated_request = types.GetOfferParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("get_offer", validated_request, types.PersonalApplication)

    async def get_multiple_offers(
        self, request: Dict[str, Any]
    ) -> types.PersonalApplication:
        try:
            validated_request = types.GetMultipleOffersParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("get_multiple_offers", validated_request, types.PersonalApplication)

    async def display_offer_form(
        self, request: Dict[str, Any]
    ) -> types.DisplayOfferFormResponse:
        try:
            validated_request = types.DisplayOfferFormParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("display_offer_form", validated_request, types.DisplayOfferFormResponse)

    async def track_offer_status(
        self, request: Dict[str, Any]
    ) -> types.TrackOfferStatusResponse:
        try:
            validated_request = types.TrackOfferStatusParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("track_offer_status", validated_request, types.TrackOfferStatusResponse)

    async def display_upload_documents_form(
        self, request: Dict[str, Any]
    ) -> types.DisplayUploadDocumentsFormResponse:
        try:
            validated_request = types.DisplayUploadDocumentsFormParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(
            "display_upload_documents_form",
            validated_request,
            types.DisplayUploadDocumentsFormResponse,
        )

    async def submit_documents(
        self, request: Dict[str, Any]
    ) -> types.SubmitDocumentsResponse:
        try:
            validated_request = types.SubmitDocumentsParams.model_validate(request)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool("submit_documents", validated_request, types.SubmitDocumentsResponse)

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
        self, tool_name: str, request: BaseModel, response_cls: Type[T]
    ) -> T:
        # Pydantic models are passed in, dump to dict for MCP call
        request_data = request.model_dump(by_alias=True, exclude_none=True)
        tool_result = await self._mcp_client.call_tool(tool_name, request_data)
        data = self._parse_json_response(tool_result)
        data["widget"] = self._get_widget(tool_result)

        try:
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
