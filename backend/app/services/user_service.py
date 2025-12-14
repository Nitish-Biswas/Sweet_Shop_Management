"""
User service layer containing authentication and user management business logic.
Implements separation of concerns and follows SOLID principles.
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import (
    DuplicateResourceException,
    AuthenticationException,
    ResourceNotFoundException
)
from app.schemas.user import UserRegisterRequest, UserLoginRequest
from app.config import settings


class UserService:
    """Service class for user-related operations."""
    
    @staticmethod
    def register(db: Session, request: UserRegisterRequest) -> User:
        """
        Register a new user with email and password.
        
        Args:
            db: Database session
            request: User registration request data
            
        Returns:
            User: Created user object
            
        Raises:
            DuplicateResourceException: If email already exists
        """
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise DuplicateResourceException(f"User with email {request.email} already exists")
        
        # Create new user
        hashed_password = hash_password(request.password)
        
        # Auto-promote to admin if email matches configuration
        is_admin = (request.email == settings.admin_email)
        
        new_user = User(
            email=request.email,
            full_name=request.full_name,
            hashed_password=hashed_password,
            is_admin=is_admin
        )
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user
        except IntegrityError:
            db.rollback() # Clean up the failed transaction
            # Convert DB Error -> Custom App Error
            raise DuplicateResourceException(f"User with email {request.email} already exists")
    
    @staticmethod
    def login(db: Session, request: UserLoginRequest) -> tuple[User, str]:
        """
        Authenticate user and generate access token.
        
        Args:
            db: Database session
            request: User login request data
            
        Returns:
            tuple: (User object, JWT access token)
            
        Raises:
            AuthenticationException: If credentials are invalid
        """
        # Find user by email
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise AuthenticationException("Invalid email or password")
        
        # Verify password
        if not verify_password(request.password, user.hashed_password):
            raise AuthenticationException("Invalid email or password")
        
        # Check if user is active
        if not user.is_active:
            raise AuthenticationException("User account is disabled")
        
        # Generate token
        token = create_access_token(
            user_id=user.id,
            email=user.email,
            is_admin=user.is_admin
        )
        
        return user, token
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """
        Retrieve user by ID.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User: User object
            
        Raises:
            ResourceNotFoundException: If user not found
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ResourceNotFoundException(f"User with ID {user_id} not found")
        return user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """
        Retrieve user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            User: User object
            
        Raises:
            ResourceNotFoundException: If user not found
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise ResourceNotFoundException(f"User with email {email} not found")
        return user
    
    @staticmethod
    def list_all_users(db: Session, skip: int = 0, limit: int = 10) -> list[User]:
        """
        List all users with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum records to return
            
        Returns:
            list: List of User objects
        """
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_user_role(db: Session, user_id: int, is_admin: bool) -> User:
        """
        Update user admin status (admin-only operation).
        
        Args:
            db: Database session
            user_id: User ID
            is_admin: Admin status
            
        Returns:
            User: Updated user object
            
        Raises:
            ResourceNotFoundException: If user not found
        """
        user = UserService.get_user_by_id(db, user_id)
        user.is_admin = is_admin
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def deactivate_user(db: Session, user_id: int) -> User:
        """
        Deactivate a user account.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User: Updated user object
        """
        user = UserService.get_user_by_id(db, user_id)
        user.is_active = False
        db.commit()
        db.refresh(user)
        return user
