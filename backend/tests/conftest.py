"""
Test configuration and fixtures for pytest.
Sets up test database, fixtures, and application for testing.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.sweet import Sweet
from app.core.security import hash_password


# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def db():
    """Provide test database session."""
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    """Provide FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def test_user_data():
    """Provide test user registration data."""
    return {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "TestPassword123"
    }


@pytest.fixture
def test_admin_data():
    """Provide test admin registration data."""
    return {
        "email": "admin@example.com",
        "full_name": "Admin User",
        "password": "AdminPassword123"
    }


@pytest.fixture
def test_sweet_data():
    """Provide test sweet creation data."""
    return {
        "name": "Chocolate Truffle",
        "description": "Rich dark chocolate truffle",
        "category": "Chocolate",
        "price": 5.99,
        "quantity": 100
    }


@pytest.fixture
def registered_user(db: Session, test_user_data):
    """Create and return a registered user for testing."""
    user = User(
        email=test_user_data["email"],
        full_name=test_user_data["full_name"],
        hashed_password=hash_password(test_user_data["password"]),
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def registered_admin(db: Session, test_admin_data):
    """Create and return a registered admin user for testing."""
    user = User(
        email=test_admin_data["email"],
        full_name=test_admin_data["full_name"],
        hashed_password=hash_password(test_admin_data["password"]),
        is_admin=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_sweet(db: Session, test_sweet_data):
    """Create and return a test sweet for testing."""
    sweet = Sweet(
        name=test_sweet_data["name"],
        description=test_sweet_data["description"],
        category=test_sweet_data["category"],
        price=test_sweet_data["price"],
        quantity=test_sweet_data["quantity"],
        is_available=True
    )
    db.add(sweet)
    db.commit()
    db.refresh(sweet)
    return sweet


# In conftest.py

@pytest.fixture
def auth_token(client, test_user_data, registered_user):
    """Get authentication token for test user."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
    )
    # FIX: Remove ["token"] - response is flat
    return response.json()["access_token"] 


@pytest.fixture
def admin_token(client, test_admin_data, registered_admin):
    """Get authentication token for admin user."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_admin_data["email"],
            "password": test_admin_data["password"]
        }
    )
    # FIX: Remove ["token"] - response is flat
    return response.json()["access_token"]

# @pytest.fixture
# def auth_token(client, test_user_data, registered_user):
#     """Get authentication token for test user."""
#     response = client.post(
#         "/api/auth/login",
#         json={
#             "email": test_user_data["email"],
#             "password": test_user_data["password"]
#         }
#     )
#     return response.json()["token"]["access_token"]


# @pytest.fixture
# def admin_token(client, test_admin_data, registered_admin):
#     """Get authentication token for admin user."""
#     response = client.post(
#         "/api/auth/login",
#         json={
#             "email": test_admin_data["email"],
#             "password": test_admin_data["password"]
#         }
#     )
#     return response.json()["token"]["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    """Get authorization headers with user token."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def admin_headers(admin_token):
    """Get authorization headers with admin token."""
    return {"Authorization": f"Bearer {admin_token}"}
