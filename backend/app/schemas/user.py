"""
Pydantic request/response schemas for user authentication.
Handles validation and serialization of user data.
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional


# ==================== Request Schemas ====================

class UserRegisterRequest(BaseModel):
    """Schema for user registration request."""
    
    email: EmailStr = Field(..., description="User email address")
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name")
    password: str = Field(..., min_length=8, max_length=100, description="Password")
    
    # NEW: Pydantic V2 Syntax
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "password": "SecurePassword123"
            }
        }
    )


class UserLoginRequest(BaseModel):
    """Schema for user login request."""
    
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    
    # NEW: Pydantic V2 Syntax
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "password": "SecurePassword123"
            }
        }
    )


# ==================== Response Schemas ====================

class UserResponse(BaseModel):
    """Schema for user response data."""
    
    id: int
    email: str
    full_name: str
    is_admin: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # NEW: Pydantic V2 Syntax
    # from_attributes=True replaces the old from_orm=True
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "John Doe",
                "is_admin": False,
                "is_active": True,
                # These are JUST EXAMPLES for the API docs
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        }
    )


class TokenResponse(BaseModel):
    """Schema for token response."""
    
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    user: UserResponse


class AuthResponse(BaseModel):
    """Schema for authentication response (registration or login)."""
    
    message: str
    token: Optional[TokenResponse] = None
    user: Optional[UserResponse] = None