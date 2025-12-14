"""
SQLAlchemy ORM models for the Sweet Shop Management System.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Sweet(Base):
    """Sweet product model for inventory management."""
    
    __tablename__ = "sweets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, index=True, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=0, nullable=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchases = relationship("Purchase", back_populates="sweet", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Sweet(id={self.id}, name='{self.name}', price={self.price}, quantity={self.quantity})>"


class Purchase(Base):
    """Purchase history model for tracking sweet purchases."""
    
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    sweet_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Foreign keys with relationship
    from sqlalchemy import ForeignKey
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sweet_id = Column(Integer, ForeignKey("sweets.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="purchases")
    sweet = relationship("Sweet", back_populates="purchases")
    
    def __repr__(self):
        return f"<Purchase(id={self.id}, user_id={self.user_id}, sweet_id={self.sweet_id}, quantity={self.quantity})>"
