from ..utils.errors import ValidationError
from .base import BaseResource
from ..types import (
    LoanCalculation,
    LoanCalculationResult,
    LoanComparisonRequest,
    LoanComparisonResponse,
)

class Loans(BaseResource):
    async def compare(self, request: LoanComparisonRequest) -> LoanComparisonResponse:
        self._validate_comparison_request(request)
        tool_result = await self._client.call_tool(
            "find_business_loan_options",
            request,
        )
        data = self._parse_json_response(tool_result)
        data["widget"] = self._get_widget(tool_result)
        return data

    async def calculate(self, params: LoanCalculation) -> LoanCalculationResult:
        tool_result = await self._client.call_tool(
            "calculate_loan_payment",
            params,
        )
        return self._parse_json_response(tool_result)

    def _validate_comparison_request(self, request: LoanComparisonRequest) -> None:
        if not request.get("amount") or request.get("amount", 0) < 5000:
            raise ValidationError("Loan amount must be at least $5,000")

        if not request.get("purpose"):
            raise ValidationError("Loan purpose is required")

        business = request.get("business")
        if not business:
            raise ValidationError("Business information is required")

        if not business.get("revenue") or business.get("revenue", 0) < 0:
            raise ValidationError("Valid business revenue is required")

        credit_score = business.get("creditScore", 0)
        if not credit_score or not (300 <= credit_score <= 850):
            raise ValidationError("Credit score must be between 300 and 850")
