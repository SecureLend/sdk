"""
SecureLend SDK for Python

Official SDK for SecureLend - Financial services infrastructure for AI
"""

__version__ = "0.2.0"

from .client import SecureLend
from .utils.errors import (
    AuthenticationError,
    ConsentRequiredError,
    FeatureDisabledError,
    InvalidTransitionError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    SecureLendError,
    ServerError,
    ValidationError,
    WebhookSignatureError,
)
from . import types

__all__ = [
    "SecureLend",
    "SecureLendError",
    "AuthenticationError",
    "RateLimitError",
    "ValidationError",
    "NotFoundError",
    "NetworkError",
    "ServerError",
    "FeatureDisabledError",
    "ConsentRequiredError",
    "InvalidTransitionError",
    "WebhookSignatureError",
    "types",
]
