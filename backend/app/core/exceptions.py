"""
Custom exceptions for the Sweet Shop Management System.
"""


class SweetShopException(Exception):
    """Base exception for all Sweet Shop errors."""
    pass


class AuthenticationException(SweetShopException):
    """Raised when authentication fails."""
    pass


class AuthorizationException(SweetShopException):
    """Raised when user lacks required permissions."""
    pass


class ResourceNotFoundException(SweetShopException):
    """Raised when a requested resource is not found."""
    pass


class ValidationException(SweetShopException):
    """Raised when validation of data fails."""
    pass


class DuplicateResourceException(SweetShopException):
    """Raised when trying to create a duplicate resource."""
    pass


class InsufficientInventoryException(SweetShopException):
    """Raised when attempting to purchase more items than available."""
    pass
