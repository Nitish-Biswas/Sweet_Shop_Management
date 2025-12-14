"""
Pydantic request/response schemas for sweet product management.
Handles validation and serialization of sweet data.
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List


# ==================== Request Schemas ====================

class SweetCreateRequest(BaseModel):
    """Schema for creating a new sweet."""
    
    name: str = Field(..., min_length=2, max_length=100, description="Sweet name")
    description: Optional[str] = Field(None, max_length=500, description="Sweet description")
    category: str = Field(..., min_length=2, max_length=50, description="Sweet category")
    price: float = Field(..., gt=0, description="Sweet price")
    quantity: int = Field(..., ge=0, description="Initial quantity")
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "name": "Chocolate Truffle",
                "description": "Rich dark chocolate truffle",
                "category": "Chocolate",
                "price": 5.99,
                "quantity": 50
            }
        }
    )


class SweetUpdateRequest(BaseModel):
    """Schema for updating a sweet."""
    
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "price": 6.99,
                "quantity": 75
            }
        }
    )


class PurchaseRequest(BaseModel):
    """Schema for purchasing sweets."""
    
    quantity: int = Field(..., gt=0, le=1000, description="Quantity to purchase")
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "quantity": 5
            }
        }
    )


class RestockRequest(BaseModel):
    """Schema for restocking sweets."""
    
    quantity: int = Field(..., gt=0, le=10000, description="Quantity to add")
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "quantity": 100
            }
        }
    )


class SweetSearchRequest(BaseModel):
    """Schema for searching sweets."""
    
    name: Optional[str] = Field(None, description="Search by sweet name")
    category: Optional[str] = Field(None, description="Filter by category")
    min_price: Optional[float] = Field(None, ge=0, description="Minimum price")
    max_price: Optional[float] = Field(None, ge=0, description="Maximum price")
    in_stock: Optional[bool] = Field(None, description="Only in-stock items")
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "category": "Chocolate",
                "min_price": 2.0,
                "max_price": 10.0
            }
        }
    )


# ==================== Response Schemas ====================

class SweetResponse(BaseModel):
    """Schema for sweet response data."""
    
    id: int
    name: str
    description: Optional[str]
    category: str
    price: float
    quantity: int
    is_available: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Chocolate Truffle",
                "description": "Rich dark chocolate truffle",
                "category": "Chocolate",
                "price": 5.99,
                "quantity": 45,
                "is_available": True,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        }
    )


class SweetListResponse(BaseModel):
    """Schema for sweet list response."""
    
    total: int
    sweets: List[SweetResponse]
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "total": 10,
                "sweets": []
            }
        }
    )


class PurchaseResponse(BaseModel):
    """Schema for purchase response."""
    
    id: int
    user_id: int
    sweet_id: int
    quantity: int
    total_price: float
    created_at: datetime
    
    model_config = ConfigDict(
        from_attributes = True,
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "sweet_id": 1,
                "quantity": 5,
                "total_price": 29.95,
                "created_at": "2024-01-01T00:00:00"
            }
        }
    )


class OperationResponse(BaseModel):
    """Schema for successful operation response."""
    
    success: bool
    message: str
    data: Optional[dict] = None
    
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Operation completed successfully",
                "data": {}
            }
        }
    )
