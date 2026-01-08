class SecureLendError(Exception):
    """Base exception for all SecureLend SDK errors."""

    def __init__(self, message: str, error_type: str, details: any = None):
        super().__init__(message)
        self.type = error_type
        self.details = details


class AuthenticationError(SecureLendError):
    def __init__(self, message: str):
        super().__init__(message, "authentication_error")


class RateLimitError(SecureLendError):
    def __init__(self, message: str, retry_after: int | None = None):
        super().__init__(message, "rate_limit_error")
        self.retry_after = retry_after


class ValidationError(SecureLendError):
    def __init__(self, message: str, errors: any = None):
        super().__init__(message, "validation_error", errors)


class NotFoundError(SecureLendError):
    def __init__(self, message: str):
        super().__init__(message, "not_found")


class NetworkError(SecureLendError):
    def __init__(self, message: str):
        super().__init__(message, "network_error")


class ServerError(SecureLendError):
    def __init__(self, message: str):
        super().__init__(message, "server_error")
