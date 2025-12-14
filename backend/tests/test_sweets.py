"""
Unit tests for sweet management endpoints.
Tests CRUD operations, search, and inventory management.
"""

import pytest
from fastapi import status


class TestSweetCreation:
    """Test suite for sweet creation endpoint."""
    
    def test_create_sweet_success_admin(self, client, admin_headers, test_sweet_data):
        """Test successful sweet creation by admin."""
        response = client.post(
            "/api/sweets",
            json=test_sweet_data,
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == test_sweet_data["name"]
        assert data["price"] == test_sweet_data["price"]
        assert data["quantity"] == test_sweet_data["quantity"]
        assert data["is_available"] is True
    
    def test_create_sweet_unauthorized(self, client, auth_headers, test_sweet_data):
        """Test sweet creation fails for non-admin user."""
        response = client.post(
            "/api/sweets",
            json=test_sweet_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_create_sweet_duplicate_name(self, client, admin_headers, test_sweet, test_sweet_data):
        """Test creation fails with duplicate sweet name."""
        response = client.post(
            "/api/sweets",
            json=test_sweet_data,
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_create_sweet_invalid_price(self, client, admin_headers, test_sweet_data):
        """Test creation fails with invalid price."""
        test_sweet_data["price"] = -5.99
        response = client.post(
            "/api/sweets",
            json=test_sweet_data,
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    
    def test_create_sweet_missing_fields(self, client, admin_headers):
        """Test creation fails with missing required fields."""
        response = client.post(
            "/api/sweets",
            json={"name": "Incomplete Sweet"},
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


class TestSweetRetrieval:
    """Test suite for sweet retrieval endpoints."""
    
    def test_get_all_sweets(self, client, auth_headers, test_sweet):
        """Test retrieving all sweets."""
        response = client.get(
            "/api/sweets",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total" in data
        assert "sweets" in data
        assert len(data["sweets"]) > 0
    
    def test_get_sweet_by_id(self, client, auth_headers, test_sweet):
        """Test retrieving sweet by ID."""
        response = client.get(
            f"/api/sweets/{test_sweet.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_sweet.id
        assert data["name"] == test_sweet.name
    
    def test_get_nonexistent_sweet(self, client, auth_headers):
        """Test retrieving non-existent sweet."""
        response = client.get(
            "/api/sweets/99999",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_search_sweets_by_name(self, client, auth_headers, test_sweet):
        """Test searching sweets by name."""
        response = client.post(
            "/api/sweets/search",
            json={"name": "Chocolate"},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["sweets"]) > 0
        assert any(s["name"] == test_sweet.name for s in data["sweets"])
    
    def test_search_sweets_by_category(self, client, auth_headers, test_sweet):
        """Test searching sweets by category."""
        response = client.post(
            "/api/sweets/search",
            json={"category": test_sweet.category},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["sweets"]) > 0
    
    def test_search_sweets_by_price_range(self, client, auth_headers, test_sweet):
        """Test searching sweets by price range."""
        response = client.post(
            "/api/sweets/search",
            json={"min_price": 5.0, "max_price": 10.0},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(5.0 <= s["price"] <= 10.0 for s in data["sweets"])


class TestSweetUpdate:
    """Test suite for sweet update endpoint."""
    
    def test_update_sweet_success_admin(self, client, admin_headers, test_sweet):
        """Test successful sweet update by admin."""
        update_data = {
            "price": 7.99,
            "quantity": 150
        }
        response = client.put(
            f"/api/sweets/{test_sweet.id}",
            json=update_data,
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["price"] == 7.99
        assert data["quantity"] == 150
    
    def test_update_sweet_unauthorized(self, client, auth_headers, test_sweet):
        """Test sweet update fails for non-admin user."""
        response = client.put(
            f"/api/sweets/{test_sweet.id}",
            json={"price": 7.99},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_update_sweet_invalid_price(self, client, admin_headers, test_sweet):
        """Test update fails with invalid price."""
        response = client.put(
            f"/api/sweets/{test_sweet.id}",
            json={"price": -5.99},
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


class TestSweetDelete:
    """Test suite for sweet deletion endpoint."""
    
    def test_delete_sweet_success_admin(self, client, admin_headers, test_sweet):
        """Test successful sweet deletion by admin."""
        response = client.delete(
            f"/api/sweets/{test_sweet.id}",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
    
    def test_delete_sweet_unauthorized(self, client, auth_headers, test_sweet):
        """Test sweet deletion fails for non-admin user."""
        response = client.delete(
            f"/api/sweets/{test_sweet.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_delete_nonexistent_sweet(self, client, admin_headers):
        """Test deletion of non-existent sweet."""
        response = client.delete(
            "/api/sweets/99999",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
