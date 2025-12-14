"""
Sweet products and inventory management router.
Handles CRUD operations, search, and inventory transactions.
"""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.core.exceptions import (
    ResourceNotFoundException,
    AuthorizationException,
    InsufficientInventoryException
)
from app.schemas.sweet import (
    SweetCreateRequest,
    SweetUpdateRequest,
    SweetResponse,
    SweetListResponse,
    SweetSearchRequest,
    PurchaseRequest,
    RestockRequest,
    OperationResponse
)
from app.services.sweet_service import SweetService, InventoryService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/sweets", tags=["Sweets"])
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token."""
    token = credentials.credentials
    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return token_data


def require_admin(current_user = Depends(get_current_user)):
    """Verify current user is admin."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.post(
    "",
    response_model=SweetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new sweet (admin only)",
    dependencies=[Depends(require_admin)]
)
def create_sweet(
    request: SweetCreateRequest,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new sweet product (admin-only endpoint).
    
    Args:
        request: Sweet creation data
        current_user: Authenticated admin user
        db: Database session
        
    Returns:
        SweetResponse: Created sweet details
    """
    sweet = SweetService.create_sweet(db, request)
    return SweetResponse.model_validate(sweet)


@router.get(
    "",
    response_model=SweetListResponse,
    summary="Get all sweets",
    dependencies=[Depends(get_current_user)]
)
def list_sweets(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve paginated list of all sweets.
    
    Args:
        skip: Number of records to skip
        limit: Maximum records to return
        current_user: Authenticated user
        db: Database session
        
    Returns:
        SweetListResponse: List of sweets with total count
    """
    total, sweets = SweetService.list_all_sweets(db, skip, limit)
    return SweetListResponse(
        total=total,
        sweets=[SweetResponse.model_validate(s) for s in sweets]
    )


@router.get(
    "/{sweet_id}",
    response_model=SweetResponse,
    summary="Get sweet by ID",
    dependencies=[Depends(get_current_user)]
)
def get_sweet(
    sweet_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific sweet by ID.
    
    Args:
        sweet_id: Sweet ID
        current_user: Authenticated user
        db: Database session
        
    Returns:
        SweetResponse: Sweet details
    """
    sweet = SweetService.get_sweet_by_id(db, sweet_id)
    return SweetResponse.model_validate(sweet)


@router.post(
    "/search",
    response_model=SweetListResponse,
    summary="Search sweets",
    dependencies=[Depends(get_current_user)]
)
def search_sweets(
    request: SweetSearchRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search sweets by various criteria (name, category, price range).
    
    Args:
        request: Search parameters
        current_user: Authenticated user
        db: Database session
        
    Returns:
        SweetListResponse: Matching sweets
    """
    total, sweets = SweetService.search_sweets(db, request)
    return SweetListResponse(
        total=total,
        sweets=[SweetResponse.model_validate(s) for s in sweets]
    )


@router.put(
    "/{sweet_id}",
    response_model=SweetResponse,
    summary="Update sweet (admin only)",
    dependencies=[Depends(require_admin)]
)
def update_sweet(
    sweet_id: int,
    request: SweetUpdateRequest,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update sweet details (admin-only endpoint).
    
    Args:
        sweet_id: Sweet ID to update
        request: Update data
        current_user: Authenticated admin user
        db: Database session
        
    Returns:
        SweetResponse: Updated sweet details
    """
    sweet = SweetService.update_sweet(db, sweet_id, request)
    return SweetResponse.model_validate(sweet)


@router.delete(
    "/{sweet_id}",
    response_model=OperationResponse,
    summary="Delete sweet (admin only)",
    dependencies=[Depends(require_admin)]
)
def delete_sweet(
    sweet_id: int,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a sweet product (admin-only endpoint).
    
    Args:
        sweet_id: Sweet ID to delete
        current_user: Authenticated admin user
        db: Database session
        
    Returns:
        OperationResponse: Deletion confirmation
    """
    SweetService.delete_sweet(db, sweet_id)
    return OperationResponse(
        success=True,
        message="Sweet deleted successfully"
    )


@router.post(
    "/{sweet_id}/purchase",
    response_model=OperationResponse,
    summary="Purchase sweet",
    dependencies=[Depends(get_current_user)]
)
def purchase_sweet(
    sweet_id: int,
    request: PurchaseRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Purchase sweets and create purchase record.
    
    Args:
        sweet_id: Sweet ID to purchase
        request: Purchase quantity
        current_user: Authenticated user
        db: Database session
        
    Returns:
        OperationResponse: Purchase confirmation
    """
    try:
        purchase = InventoryService.purchase_sweet(
            db, current_user.user_id, sweet_id, request
        )
        return OperationResponse(
            success=True,
            message="Purchase successful",
            data={
                "purchase_id": purchase.id,
                "quantity": purchase.quantity,
                "total_price": purchase.total_price
            }
        )
    except InsufficientInventoryException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post(
    "/{sweet_id}/restock",
    response_model=SweetResponse,
    summary="Restock sweet (admin only)",
    dependencies=[Depends(require_admin)]
)
def restock_sweet(
    sweet_id: int,
    request: RestockRequest,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Restock a sweet product (admin-only endpoint).
    
    Args:
        sweet_id: Sweet ID to restock
        request: Quantity to add
        current_user: Authenticated admin user
        db: Database session
        
    Returns:
        SweetResponse: Updated sweet with new quantity
    """
    sweet = InventoryService.restock_sweet(db, sweet_id, request)
    return SweetResponse.model_validate(sweet)
