"""
Database module for Sweet Shop Management System.
Handles SQLAlchemy setup, session management, and Base model.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.config import settings
import os


# Create database engine with proper configuration
# Adapts to both SQLite (local/testing) and PostgreSQL (production)
engine_args = {
    "echo": settings.debug
}

if "sqlite" in settings.database_url:
    # SQLite specific settings
    engine_args["connect_args"] = {"check_same_thread": False}
    engine_args["poolclass"] = StaticPool
else:
    # PostgreSQL settings (production)
    # Default pooling is sufficient; no special args needed
    pass

engine = create_engine(
    settings.database_url,
    **engine_args
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session.
    Used in FastAPI route dependencies.
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database by creating all tables.
    Must be called after all models are defined.
    """
    Base.metadata.create_all(bind=engine)


def drop_db():
    """
    Drop all tables from database.
    Used for testing purposes.
    """
    Base.metadata.drop_all(bind=engine)
