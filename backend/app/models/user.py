"""
SQLAlchemy ORM models for the Sweet Shop Management System.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """User model for authentication and authorization."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchases = relationship("Purchase", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', is_admin={self.is_admin})>"