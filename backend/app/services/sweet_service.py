"""
Sweet service layer containing product and inventory management business logic.
Implements separation of concerns and follows SOLID principles.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.sweet import Sweet, Purchase
from app.models.user import User
from app.core.exceptions import (
    ResourceNotFoundException,
    DuplicateResourceException,
    InsufficientInventoryException,
    ValidationException
)
from app.schemas.sweet import (
    SweetCreateRequest,
    SweetUpdateRequest,
    PurchaseRequest,
    RestockRequest,
    SweetSearchRequest
)


class SweetService:
    """Service class for sweet product management."""
    
    @staticmethod
    def create_sweet(db: Session, request: SweetCreateRequest) -> Sweet:
        """
        Create a new sweet product.
        
        Args:
            db: Database session
            request: Sweet creation request data
            
        Returns:
            Sweet: Created sweet object
            
        Raises:
            DuplicateResourceException: If sweet name already exists
            ValidationException: If data is invalid
        """
        # Check if sweet with same name exists
        existing = db.query(Sweet).filter(Sweet.name == request.name).first()
        if existing:
            raise DuplicateResourceException(f"Sweet with name '{request.name}' already exists")
        
        # Validate price
        if request.price <= 0:
            raise ValidationException("Price must be greater than 0")
        
        # Create new sweet
        new_sweet = Sweet(
            name=request.name,
            description=request.description,
            category=request.category,
            price=request.price,
            quantity=request.quantity,
            is_available=request.quantity > 0
        )
        
        db.add(new_sweet)
        db.commit()
        db.refresh(new_sweet)
        
        return new_sweet
    
    @staticmethod
    def get_sweet_by_id(db: Session, sweet_id: int) -> Sweet:
        """
        Retrieve sweet by ID.
        
        Args:
            db: Database session
            sweet_id: Sweet ID
            
        Returns:
            Sweet: Sweet object
            
        Raises:
            ResourceNotFoundException: If sweet not found
        """
        sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
        if not sweet:
            raise ResourceNotFoundException(f"Sweet with ID {sweet_id} not found")
        return sweet
    
    @staticmethod
    def list_all_sweets(db: Session, skip: int = 0, limit: int = 100) -> tuple[int, list[Sweet]]:
        """
        List all available sweets with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum records to return
            
        Returns:
            tuple: (Total count, List of Sweet objects)
        """
        total = db.query(Sweet).count()
        sweets = db.query(Sweet).offset(skip).limit(limit).all()
        return total, sweets
    
    @staticmethod
    def search_sweets(db: Session, search_params: SweetSearchRequest) -> tuple[int, list[Sweet]]:
        """
        Search sweets by multiple criteria.
        
        Args:
            db: Database session
            search_params: Search parameters
            
        Returns:
            tuple: (Total count, List of matching Sweet objects)
        """
        query = db.query(Sweet)
        
        # Filter by name (case-insensitive partial match)
        if search_params.name:
            query = query.filter(Sweet.name.ilike(f"%{search_params.name}%"))
        
        # Filter by category
        if search_params.category:
            query = query.filter(Sweet.category == search_params.category)
        
        # Filter by price range
        if search_params.min_price is not None:
            query = query.filter(Sweet.price >= search_params.min_price)
        
        if search_params.max_price is not None:
            query = query.filter(Sweet.price <= search_params.max_price)
        
        # Filter by stock availability
        if search_params.in_stock:
            query = query.filter(Sweet.quantity > 0)
        
        total = query.count()
        sweets = query.all()
        
        return total, sweets
    
    @staticmethod
    def update_sweet(db: Session, sweet_id: int, request: SweetUpdateRequest) -> Sweet:
        """
        Update sweet details.
        
        Args:
            db: Database session
            sweet_id: Sweet ID
            request: Sweet update request data
            
        Returns:
            Sweet: Updated sweet object
            
        Raises:
            ResourceNotFoundException: If sweet not found
            ValidationException: If validation fails
        """
        sweet = SweetService.get_sweet_by_id(db, sweet_id)
        
        # Validate price if provided
        if request.price is not None and request.price <= 0:
            raise ValidationException("Price must be greater than 0")
        
        # Validate quantity if provided
        if request.quantity is not None and request.quantity < 0:
            raise ValidationException("Quantity cannot be negative")
        
        # Update fields
        if request.name is not None:
            # Check if new name already exists
            existing = db.query(Sweet).filter(
                and_(Sweet.name == request.name, Sweet.id != sweet_id)
            ).first()
            if existing:
                raise DuplicateResourceException(f"Sweet with name '{request.name}' already exists")
            sweet.name = request.name
        
        if request.description is not None:
            sweet.description = request.description
        
        if request.category is not None:
            sweet.category = request.category
        
        if request.price is not None:
            sweet.price = request.price
        
        if request.quantity is not None:
            sweet.quantity = request.quantity
            sweet.is_available = request.quantity > 0
        
        if request.is_available is not None:
            sweet.is_available = request.is_available
        
        db.commit()
        db.refresh(sweet)
        
        return sweet
    
    @staticmethod
    def delete_sweet(db: Session, sweet_id: int) -> bool:
        """
        Delete a sweet product (admin-only).
        
        Args:
            db: Database session
            sweet_id: Sweet ID
            
        Returns:
            bool: True if deleted successfully
            
        Raises:
            ResourceNotFoundException: If sweet not found
        """
        sweet = SweetService.get_sweet_by_id(db, sweet_id)
        db.delete(sweet)
        db.commit()
        return True


class InventoryService:
    """Service class for inventory management."""
    
    @staticmethod
    def purchase_sweet(
        db: Session,
        user_id: int,
        sweet_id: int,
        request: PurchaseRequest
    ) -> Purchase:
        """
        Purchase sweets and create purchase record.
        
        Args:
            db: Database session
            user_id: User ID making the purchase
            sweet_id: Sweet ID being purchased
            request: Purchase request with quantity
            
        Returns:
            Purchase: Created purchase record
            
        Raises:
            ResourceNotFoundException: If user or sweet not found
            InsufficientInventoryException: If not enough quantity available
            ValidationException: If quantity is invalid
        """
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ResourceNotFoundException(f"User with ID {user_id} not found")
        
        # Get sweet
        sweet = SweetService.get_sweet_by_id(db, sweet_id)
        
        # Validate quantity
        if request.quantity <= 0:
            raise ValidationException("Purchase quantity must be greater than 0")
        
        if request.quantity > 1000:
            raise ValidationException("Purchase quantity cannot exceed 1000")
        
        # Check inventory
        if sweet.quantity < request.quantity:
            raise InsufficientInventoryException(
                f"Insufficient inventory. Available: {sweet.quantity}, Requested: {request.quantity}"
            )
        
        # Calculate total price
        total_price = sweet.price * request.quantity
        
        # Create purchase record
        purchase = Purchase(
            user_id=user_id,
            sweet_id=sweet_id,
            quantity=request.quantity,
            total_price=total_price
        )
        
        # Update sweet inventory
        sweet.quantity -= request.quantity
        sweet.is_available = sweet.quantity > 0
        
        # Save changes
        db.add(purchase)
        db.commit()
        db.refresh(purchase)
        
        return purchase
    
    @staticmethod
    def restock_sweet(
        db: Session,
        sweet_id: int,
        request: RestockRequest
    ) -> Sweet:
        """
        Restock a sweet product (admin-only).
        
        Args:
            db: Database session
            sweet_id: Sweet ID to restock
            request: Restock request with quantity
            
        Returns:
            Sweet: Updated sweet object
            
        Raises:
            ResourceNotFoundException: If sweet not found
            ValidationException: If quantity is invalid
        """
        sweet = SweetService.get_sweet_by_id(db, sweet_id)
        
        # Validate quantity
        if request.quantity <= 0:
            raise ValidationException("Restock quantity must be greater than 0")
        
        if request.quantity > 10000:
            raise ValidationException("Restock quantity cannot exceed 10000")
        
        # Update inventory
        sweet.quantity += request.quantity
        sweet.is_available = True
        
        db.commit()
        db.refresh(sweet)
        
        return sweet
    
    @staticmethod
    def get_purchase_history(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[int, list[Purchase]]:
        """
        Get purchase history for a user.
        
        Args:
            db: Database session
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum records to return
            
        Returns:
            tuple: (Total count, List of Purchase objects)
        """
        total = db.query(Purchase).filter(Purchase.user_id == user_id).count()
        purchases = db.query(Purchase).filter(
            Purchase.user_id == user_id
        ).offset(skip).limit(limit).all()
        
        return total, purchases
