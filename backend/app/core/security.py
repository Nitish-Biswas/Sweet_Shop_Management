"""
Security and authentication module.
Handles JWT token generation, validation, and password hashing.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings


# Password hashing configuration
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class TokenData:
    """Data class for JWT token payload."""
    
    def __init__(self, user_id: int, email: str, is_admin: bool = False):
        self.user_id = user_id
        self.email = email
        self.is_admin = is_admin


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against its hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Previously hashed password
        
    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    user_id: int,
    email: str,
    is_admin: bool = False,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        user_id: User ID to include in token
        email: User email to include in token
        is_admin: Whether user is admin
        expires_delta: Token expiration time delta
        
    Returns:
        str: Encoded JWT token
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[TokenData]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        TokenData: Decoded token data, or None if invalid
        
    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        
        user_id: int = payload.get("user_id")
        email: str = payload.get("email")
        is_admin: bool = payload.get("is_admin", False)
        
        if user_id is None or email is None:
            return None
            
        return TokenData(user_id=user_id, email=email, is_admin=is_admin)
    
    except JWTError:
        return None
