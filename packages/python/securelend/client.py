import json
from typing import Any, Dict, Optional, Type, TypeVar

from pydantic import BaseModel, ValidationError as PydanticValidationError

from . import rest as rest_mod
from . import types
from .utils.errors import SecureLendError, ValidationError
from .utils.mcp import MCPClient
from .webhooks import parse_event, sign_outcome_payload, verify_webhook

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
        self,
        *,
        api_key: Optional[str] = None,
        server_url: Optional[str] = None,
        api_base_url: Optional[str] = None,
    ):
        mcp_url = server_url or "https://mcp.securelend.ai/mcp"
        self._mcp_client = MCPClient(api_key=api_key or "", mcp_url=mcp_url)
        self._api_key = api_key
        self._api_base_url = (api_base_url or "https://securelend.ai").rstrip("/")

    # --- Loan Comparison ---

    async def compare_personal_loans(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        return await self._validated_call_tool(
            "compare_personal_loans",
            request,
            types.PersonalLoanSearchParams,
            types.LoanComparisonResponse,
        )

    async def compare_business_loans(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        return await self._validated_call_tool(
            "compare_business_loans",
            request,
            types.BusinessLoanSearchParams,
            types.LoanComparisonResponse,
        )

    async def compare_personal_mortgages(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        return await self._validated_call_tool(
            "compare_personal_mortgages",
            request,
            types.MortgageSearchParams,
            types.LoanComparisonResponse,
        )

    async def compare_business_mortgages(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        return await self._validated_call_tool(
            "compare_business_mortgages",
            request,
            types.MortgageSearchParams,
            types.LoanComparisonResponse,
        )

    async def compare_car_loans(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        return await self._validated_call_tool(
            "compare_car_loans",
            request,
            types.AutoLoanSearchParams,
            types.LoanComparisonResponse,
        )

    async def compare_student_loans(
        self, request: Dict[str, Any]
    ) -> types.LoanComparisonResponse:
        return await self._validated_call_tool(
            "compare_student_loans",
            request,
            types.StudentLoanSearchParams,
            types.LoanComparisonResponse,
        )

    # --- Banking & Credit Cards ---

    async def compare_business_banking(
        self, request: Dict[str, Any]
    ) -> types.BusinessBankingComparisonResponse:
        return await self._validated_call_tool(
            "compare_business_banking",
            request,
            types.BusinessBankingSearchSchema,
            types.BusinessBankingComparisonResponse,
        )

    async def compare_personal_banking(
        self, request: Dict[str, Any]
    ) -> types.PersonalBankingComparisonResponse:
        return await self._validated_call_tool(
            "compare_personal_banking",
            request,
            types.PersonalBankingSearchSchema,
            types.PersonalBankingComparisonResponse,
        )

    async def compare_savings_accounts(
        self, request: Dict[str, Any]
    ) -> types.SavingsAccountComparisonResponse:
        return await self._validated_call_tool(
            "compare_savings_accounts",
            request,
            types.SavingsSearchSchema,
            types.SavingsAccountComparisonResponse,
        )

    async def compare_business_credit_cards(
        self, request: Dict[str, Any]
    ) -> types.BusinessCreditCardComparisonResponse:
        return await self._validated_call_tool(
            "compare_business_credit_cards",
            request,
            types.BusinessCreditCardSearchParams,
            types.BusinessCreditCardComparisonResponse,
        )

    async def compare_personal_credit_cards(
        self, request: Dict[str, Any]
    ) -> types.PersonalCreditCardComparisonResponse:
        return await self._validated_call_tool(
            "compare_personal_credit_cards",
            request,
            types.PersonalCreditCardSearchSchema,
            types.PersonalCreditCardComparisonResponse,
        )

    # --- Financial Calculators ---

    async def calculate_loan_payment(
        self, request: Dict[str, Any]
    ) -> types.LoanCalculationResponse:
        return await self._validated_call_tool(
            "calculate_loan_payment",
            request,
            types.LoanPaymentParams,
            types.LoanCalculationResponse,
        )

    async def calculate_mortgage_payment(
        self, request: Dict[str, Any]
    ) -> types.MortgageCalculationResponse:
        return await self._validated_call_tool(
            "calculate_mortgage_payment",
            request,
            types.MortgagePaymentParams,
            types.MortgageCalculationResponse,
        )

    async def compare_lease_vs_purchase(
        self, request: Dict[str, Any]
    ) -> types.LeaseVsPurchaseResponse:
        return await self._validated_call_tool(
            "compare_lease_vs_purchase",
            request,
            types.LeaseVsPurchaseParams,
            types.LeaseVsPurchaseResponse,
        )

    # --- Application Management ---

    async def get_offer(self, request: Dict[str, Any]) -> types.PersonalApplication:
        return await self._validated_call_tool(
            "get_offer", request, types.GetOfferParams, types.PersonalApplication
        )

    async def get_multiple_offers(
        self, request: Dict[str, Any]
    ) -> types.PersonalApplication:
        return await self._validated_call_tool(
            "get_multiple_offers",
            request,
            types.GetMultipleOffersParams,
            types.PersonalApplication,
        )

    async def display_offer_form(
        self, request: Dict[str, Any]
    ) -> types.DisplayOfferFormResponse:
        return await self._validated_call_tool(
            "display_offer_form",
            request,
            types.DisplayOfferFormParams,
            types.DisplayOfferFormResponse,
        )

    async def track_offer_status(
        self, request: Dict[str, Any]
    ) -> types.TrackOfferStatusResponse:
        return await self._validated_call_tool(
            "track_offer_status",
            request,
            types.TrackOfferStatusParams,
            types.TrackOfferStatusResponse,
        )

    async def display_upload_documents_form(
        self, request: Dict[str, Any]
    ) -> types.DisplayUploadDocumentsFormResponse:
        return await self._validated_call_tool(
            "display_upload_documents_form",
            request,
            types.DisplayUploadDocumentsFormParams,
            types.DisplayUploadDocumentsFormResponse,
        )

    async def submit_documents(
        self, request: Dict[str, Any]
    ) -> types.SubmitDocumentsResponse:
        return await self._validated_call_tool(
            "submit_documents",
            request,
            types.SubmitDocumentsParams,
            types.SubmitDocumentsResponse,
        )

    # --- Core Methods ---

    async def connect(self) -> None:
        """Manually connect to the MCP server."""
        await self._mcp_client.connect()

    def set_api_key(self, api_key: str) -> None:
        """Update API key for multi-tenant applications."""
        self._mcp_client.set_api_key(api_key)

    # --- Lender loop. REST base, not the comparison MCP host. ---

    _OUTCOME_STATES = {
        "viewed",
        "info_requested",
        "declined",
        "term_sheet",
        "approved",
        "funded",
        "withdrawn",
    }
    _REASON_CODES = {
        "outside_credit_box",
        "industry",
        "time_in_business",
        "dscr",
        "collateral",
        "amount",
        "state",
        "credit_score",
        "docs_incomplete",
        "capacity",
        "other",
    }

    def _url(self, path: str) -> str:
        return f"{self._api_base_url}{path}"

    async def record_outcome(self, lead_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        state = str((payload or {}).get("state") or "").strip()
        if state not in self._OUTCOME_STATES:
            raise ValidationError("That outcome state is not recognized.")
        reason = str(payload.get("reasonCode") or "").strip()
        if state == "declined":
            if reason not in self._REASON_CODES:
                raise ValidationError("A decline needs a reason code.")
            if reason == "other" and not str(payload.get("reasonText") or "").strip():
                raise ValidationError("A decline needs a reason code.")
        if state == "funded":
            amount = payload.get("fundedAmount")
            funded_on = str(payload.get("fundedOn") or "").strip()
            if not isinstance(amount, (int, float)) or isinstance(amount, bool) or amount <= 0:
                raise ValidationError("Funded needs an amount.")
            if len(funded_on) != 10 or funded_on[4] != "-" or funded_on[7] != "-":
                raise ValidationError("Funded needs a date as YYYY-MM-DD.")
        return await rest_mod.request_json(
            "POST",
            self._url(f"/v1/leads/{lead_id}/outcomes"),
            api_key=self._api_key,
            body=payload,
            feature_gated=True,
        )

    async def list_outcomes(self, lead_id: str) -> Any:
        page = await rest_mod.request_json(
            "GET",
            self._url(f"/v1/leads/{lead_id}/outcomes"),
            api_key=self._api_key,
            feature_gated=True,
        )
        return page.get("items", []) if isinstance(page, dict) else page

    def sign_outcome_payload(self, raw: str, secret: str) -> str:
        return sign_outcome_payload(raw, secret)

    async def get_credit_box(self) -> Any:
        return await rest_mod.request_json(
            "GET",
            self._url("/v1/credit-box"),
            api_key=self._api_key,
            feature_gated=True,
        )

    async def put_credit_box(self, criteria: Dict[str, Any]) -> Any:
        body = criteria if isinstance(criteria, dict) and "criteria" in criteria else {"criteria": criteria}
        return await rest_mod.request_json(
            "PUT",
            self._url("/v1/credit-box"),
            api_key=self._api_key,
            body=body,
            feature_gated=True,
        )

    async def pause_credit_box(self, until: Optional[str] = None) -> Any:
        return await rest_mod.request_json(
            "POST",
            self._url("/v1/credit-box/pause"),
            api_key=self._api_key,
            body={"until": until} if until else {},
            feature_gated=True,
        )

    async def resume_credit_box(self) -> Any:
        return await rest_mod.request_json(
            "POST",
            self._url("/v1/credit-box/resume"),
            api_key=self._api_key,
            body={},
            feature_gated=True,
        )

    async def submit_feedback(self, event: Dict[str, Any]) -> Any:
        if not event or not event.get("type") or not (event.get("target") or {}).get("kind"):
            raise ValidationError("Feedback needs a target.")
        return await rest_mod.request_json(
            "POST",
            self._url("/v1/feedback"),
            api_key=self._api_key,
            body=event,
            feature_gated=True,
        )

    def verify_webhook(self, raw: str, signature_header: str, secret: str, tolerance_sec: int = 300) -> bool:
        return verify_webhook(raw, signature_header, secret, tolerance_sec=tolerance_sec)

    def parse_event(self, payload: Dict[str, Any]) -> dict:
        return parse_event(payload)

    def enable_debug(self) -> None:
        """Enable debug logging."""
        self._mcp_client.enable_debug()

    def disable_debug(self) -> None:
        """Disable debug logging."""
        self._mcp_client.disable_debug()

    async def aclose(self):
        """Gracefully close the connection to the MCP server."""
        await self._mcp_client.close()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.aclose()

    # --- Private Helpers ---

    async def _validated_call_tool(
        self,
        tool_name: str,
        request_data: Dict[str, Any],
        request_cls: Type[BaseModel],
        response_cls: Type[T],
    ) -> T:
        try:
            validated_request = request_cls.model_validate(request_data)
        except PydanticValidationError as e:
            raise ValidationError("Invalid request parameters", errors=e.errors()) from e
        return await self._call_tool(tool_name, validated_request, response_cls)

    async def _call_tool(
        self, tool_name: str, request: BaseModel, response_cls: Type[T]
    ) -> T:
        # Pydantic models are passed in, dump to dict for MCP call
        request_data = request.model_dump(by_alias=True, exclude_none=True)
        tool_result_dict = await self._mcp_client.call_tool(tool_name, request_data)
        tool_result = types.ToolResult.model_validate(tool_result_dict)
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
        if tool_result.structured_content:
            return tool_result.structured_content

        content_list = tool_result.content
        if not isinstance(content_list, list):
            raise SecureLendError(
                "Invalid response: content is not a list", "server_error"
            )

        for item in content_list:
            if item.type == "text" and item.text:
                try:
                    return json.loads(item.text)
                except json.JSONDecodeError as e:
                    raise SecureLendError(
                        f"Failed to parse JSON response: {e}", "server_error"
                    ) from e
            elif (
                item.type == "resource"
                and item.resource
                and item.resource.mime_type == "application/json"
                and item.resource.text
            ):
                try:
                    return json.loads(item.resource.text)
                except json.JSONDecodeError as e:
                    raise SecureLendError(
                        f"Failed to parse JSON response: {e}", "server_error"
                    ) from e

        raise SecureLendError(
            "Invalid response from MCP server: missing JSON content", "server_error"
        )

    def _get_widget(self, tool_result: types.ToolResult) -> Optional[str]:
        content_list = tool_result.content
        if not isinstance(content_list, list):
            return None

        for item in content_list:
            if (
                item.type == "resource"
                and item.resource
                and item.resource.mime_type == "text/html"
            ):
                return item.resource.text
        return None
