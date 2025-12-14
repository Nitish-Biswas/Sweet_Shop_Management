"""
Unit tests for inventory management endpoints.
Tests purchase and restock operations.
"""

import pytest
from fastapi import status


class TestPurchaseSweet:
    """Test suite for sweet purchase endpoint."""
    
    def test_purchase_sweet_success(self, client, auth_headers, test_sweet):
        """Test successful sweet purchase."""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/purchase",
            json={"quantity": 5},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["data"]["quantity"] == 5
    
    def test_purchase_sweet_insufficient_inventory(self, client, auth_headers, test_sweet):
        """Test purchase fails with insufficient inventory."""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/purchase",
            json={"quantity": 1000},  # More than available
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_purchase_sweet_unauthorized(self, client, test_sweet):
        """Test purchase fails without authentication."""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/purchase",
            json={"quantity": 5}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_purchase_sweet_invalid_quantity(self, client, auth_headers, test_sweet):
        """Test purchase fails with invalid quantity."""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/purchase",
            json={"quantity": 0},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    
    def test_purchase_nonexistent_sweet(self, client, auth_headers):
        """Test purchase of non-existent sweet."""
        response = client.post(
            "/api/sweets/99999/purchase",
            json={"quantity": 5},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestRestockSweet:
    """Test suite for sweet restock endpoint."""
    
    def test_restock_sweet_success_admin(self, client, admin_headers, test_sweet):
        """Test successful sweet restock by admin."""
        initial_quantity = test_sweet.quantity
        response = client.post(
            f"/api/sweets/{test_sweet.id}/restock",
            json={"quantity": 50},
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["quantity"] == initial_quantity + 50
    
    def test_restock_sweet_unauthorized(self, client, auth_headers, test_sweet):
        """Test restock fails for non-admin user."""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/restock",
            json={"quantity": 50},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_restock_sweet_invalid_quantity(self, client, admin_headers, test_sweet):
        """Test restock fails with invalid quantity."""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/restock",
            json={"quantity": -10},
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    
    def test_restock_nonexistent_sweet(self, client, admin_headers):
        """Test restock of non-existent sweet."""
        response = client.post(
            "/api/sweets/99999/restock",
            json={"quantity": 50},
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestInventoryIntegration:
    """Integration tests for inventory management."""
    
    def test_purchase_updates_inventory(self, client, auth_headers, test_sweet, db):
        """Test that purchase correctly updates inventory."""
        initial_quantity = test_sweet.quantity
        
        # Make purchase
        response = client.post(
            f"/api/sweets/{test_sweet.id}/purchase",
            json={"quantity": 10},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        db.expire_all()
        
        # Verify inventory updated
        from app.models.sweet import Sweet
        updated_sweet = db.query(Sweet).filter(Sweet.id == test_sweet.id).first()
        assert updated_sweet.quantity == initial_quantity - 10
    
    def test_sweet_becomes_unavailable_when_out_of_stock(self, client, admin_headers, auth_headers, db):
        """Test that sweet becomes unavailable when quantity reaches 0."""
        from app.models.sweet import Sweet
        from app.schemas.sweet import SweetCreateRequest
        
        # Create sweet with quantity of 1
        response = client.post(
            "/api/sweets",
            json={
                "name": "Limited Sweet",
                "category": "Limited",
                "price": 3.99,
                "quantity": 1
            },
            headers=admin_headers
        )
        sweet_id = response.json()["id"]
        
        # Purchase the only item
        response = client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": 1},
            headers=auth_headers
        )
        
        # Verify sweet is no longer available
        sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
        assert sweet.is_available is False
        assert sweet.quantity == 0
