from ..utils.errors import ValidationError
from .base import BaseResource
from ..types import BankingComparisonRequest, BankingComparisonResponse

class Banking(BaseResource):
    async def compare(self, request: BankingComparisonRequest) -> BankingComparisonResponse:
        self._validate_banking_request(request)
        tool_result = await self._client.call_tool(
            "find_banking_accounts",
            request,
        )
        data = self._parse_json_response(tool_result)
        data["widget"] = self._get_widget(tool_result)
        return data

    def _validate_banking_request(self, request: BankingComparisonRequest) -> None:
        account_type = request.get("accountType")
        if not account_type:
            raise ValidationError("Account type is required")

        valid_types = ["checking", "savings", "both"]
        if account_type not in valid_types:
            raise ValidationError(
                f"Invalid account type. Must be one of: {', '.join(valid_types)}"
            )
