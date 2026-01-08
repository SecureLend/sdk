from ..utils.errors import ValidationError
from .base import BaseResource
from ..types import CreditCardComparisonRequest, CreditCardComparisonResponse

class CreditCards(BaseResource):
    async def compare(
        self, request: CreditCardComparisonRequest
    ) -> CreditCardComparisonResponse:
        self._validate_card_request(request)
        tool_result = await self._client.call_tool("find_credit_cards", request)
        data = self._parse_json_response(tool_result)
        data["widget"] = self._get_widget(tool_result)
        return data

    def _validate_card_request(self, request: CreditCardComparisonRequest) -> None:
        credit_score = request.get("creditScore")
        if not credit_score or not (300 <= credit_score <= 850):
            raise ValidationError("Valid credit score (300-850) is required")

        monthly_spend = request.get("monthlySpend")
        if monthly_spend is None or monthly_spend < 0:
            raise ValidationError("Monthly spend must be a positive number")
