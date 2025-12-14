"""
Authentication router for user registration and login endpoints.
Handles JWT token generation and user authentication.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse, AuthResponse
from app.services.user_service import UserService
from app.core.exceptions import DuplicateResourceException, AuthenticationException

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    responses={
        201: {"description": "User registered successfully"},
        400: {"description": "User already exists"},
        422: {"description": "Validation error"}
    }
)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user with email and password.
    
    Args:
        request: User registration data (email, full_name, password)
        db: Database session
        
    Returns:
        AuthResponse: Registration confirmation with user details
        
    Raises:
        DuplicateResourceException: If email already registered
    """
    try:
        user = UserService.register(db, request)
        return AuthResponse(
            message="User registered successfully",
            user=UserResponse.model_validate(user)
        )
    except DuplicateResourceException as e:
        raise e


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
        422: {"description": "Validation error"}
    }
)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT access token.
    
    Args:
        request: Login credentials (email, password)
        db: Database session
        
    Returns:
        TokenResponse: JWT token and user information
        
    Raises:
        AuthenticationException: If credentials are invalid
    """
    try:
        user, token = UserService.login(db, request)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    except AuthenticationException as e:
        raise e
