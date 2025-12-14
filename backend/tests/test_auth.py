"""
Unit tests for authentication endpoints.
Tests user registration, login, and token management.
"""

import pytest
from fastapi import status


class TestUserRegistration:
    """Test suite for user registration endpoint."""
    
    def test_user_registration_success(self, client, test_user_data):
        """Test successful user registration."""
        response = client.post(
            "/api/auth/register",
            json=test_user_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert data["user"]["email"] == test_user_data["email"]
        assert data["user"]["full_name"] == test_user_data["full_name"]
        assert data["user"]["is_admin"] is False
        assert "hashed_password" not in data["user"]
    
    def test_user_registration_duplicate_email(self, client, test_user_data, registered_user):
        """Test registration fails with duplicate email."""
        response = client.post(
            "/api/auth/register",
            json=test_user_data
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "already exists" in data["detail"]
    
    def test_user_registration_invalid_email(self, client):
        """Test registration fails with invalid email."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "invalid-email",
                "full_name": "Test User",
                "password": "TestPassword123"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    
    def test_user_registration_short_password(self, client):
        """Test registration fails with short password."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "full_name": "Test User",
                "password": "short"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    
    def test_user_registration_missing_fields(self, client):
        """Test registration fails with missing required fields."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


# tests/test_auth.py

class TestUserLogin:
    """Test suite for user login endpoint."""
    
    def test_login_success(self, client, test_user_data, registered_user):
        """Test successful user login."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # FIX: Structure is flat, not nested under "token"
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
        # FIX: User data is nested under "user"
        assert data["user"]["email"] == test_user_data["email"]
    
    # FIX: Added 'db' fixture to create tables
    def test_login_invalid_email(self, client, db):
        """Test login fails with non-existent email."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SomePassword123"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # FIX: Added 'db' fixture
    def test_login_invalid_password(self, client, test_user_data, registered_user, db):
        """Test login fails with incorrect password."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": test_user_data["email"],
                "password": "WrongPassword123"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_missing_email(self, client):
        """Test login fails with missing email."""
        response = client.post(
            "/api/auth/login",
            json={
                "password": "TestPassword123"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT



class TestTokenValidation:
    """Test suite for token validation and protected routes."""
    
    def test_access_protected_route_with_token(self, client, auth_headers, test_sweet):
        """Test accessing protected route with valid token."""
        response = client.get(
            "/api/sweets",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_access_protected_route_without_token(self, client):
        """Test accessing protected route without token."""
        response = client.get("/api/sweets")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_access_protected_route_invalid_token(self, client):
        """Test accessing protected route with invalid token."""
        response = client.get(
            "/api/sweets",
            headers={"Authorization": "Bearer invalid-token"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
