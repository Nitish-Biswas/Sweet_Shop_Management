"""
Integration tests for Sweet Shop Management System.
Tests complete end-to-end user workflows.
"""

import pytest
from fastapi import status


class TestUserWorkflow:
    """Integration tests for complete user workflows."""
    
    def test_complete_user_registration_login_workflow(self, client,db):
        """Test complete user registration and login flow."""
        # Step 1: Register new user
        register_data = {
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "SecurePassword123"
        }
        
        response = client.post("/api/auth/register", json=register_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["user"]["email"] == register_data["email"]
        
        # Step 2: Login with registered credentials
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == status.HTTP_200_OK
        token = response.json()["access_token"]
        assert token is not None
        
        # Step 3: Use token to access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/sweets", headers=headers)
        assert response.status_code == status.HTTP_200_OK


class TestAdminWorkflow:
    """Integration tests for admin user workflows."""
    
    def test_complete_sweet_management_workflow(self, client, admin_headers):
        """Test complete sweet creation, update, and deletion workflow."""
        # Step 1: Create sweet
        sweet_data = {
            "name": "Integration Test Sweet",
            "description": "Test sweet for integration",
            "category": "Test Category",
            "price": 9.99,
            "quantity": 50
        }
        
        response = client.post("/api/sweets", json=sweet_data, headers=admin_headers)
        assert response.status_code == status.HTTP_201_CREATED
        sweet_id = response.json()["id"]
        
        # Step 2: Retrieve created sweet
        response = client.get(f"/api/sweets/{sweet_id}", headers=admin_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["name"] == sweet_data["name"]
        
        # Step 3: Update sweet
        update_data = {"price": 11.99, "quantity": 75}
        response = client.put(f"/api/sweets/{sweet_id}", json=update_data, headers=admin_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["price"] == 11.99
        
        # Step 4: Restock sweet
        restock_data = {"quantity": 100}
        response = client.post(f"/api/sweets/{sweet_id}/restock", json=restock_data, headers=admin_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["quantity"] == 175  # 75 + 100
        
        # Step 5: Delete sweet
        response = client.delete(f"/api/sweets/{sweet_id}", headers=admin_headers)
        assert response.status_code == status.HTTP_200_OK
        
        # Step 6: Verify deletion
        response = client.get(f"/api/sweets/{sweet_id}", headers=admin_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestCustomerPurchaseWorkflow:
    """Integration tests for customer purchase workflows."""
    
    def test_complete_purchase_workflow(self, client, auth_headers, admin_headers, db):
        """Test complete purchase workflow for customer."""
        # Step 1: Admin creates sweet
        sweet_data = {
            "name": "Purchase Test Sweet",
            "category": "Test",
            "price": 5.99,
            "quantity": 100
        }
        
        response = client.post("/api/sweets", json=sweet_data, headers=admin_headers)
        assert response.status_code == status.HTTP_201_CREATED
        sweet_id = response.json()["id"]
        
        # Step 2: Customer views all sweets
        response = client.get("/api/sweets", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["total"] > 0
        
        # Step 3: Customer searches for sweet
        response = client.post(
            "/api/sweets/search",
            json={"category": "Test"},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()["sweets"]) > 0
        
        # Step 4: Customer purchases sweet
        response = client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": 10},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["quantity"] == 10
        
        # Step 5: Verify inventory updated
        response = client.get(f"/api/sweets/{sweet_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["quantity"] == 90


class TestSearchFunctionality:
    """Integration tests for search and filter functionality."""
    
    def test_search_by_multiple_criteria(self, client, auth_headers, admin_headers):
        """Test searching by multiple criteria simultaneously."""
        # Create test sweets
        sweets_data = [
            {
                "name": "Expensive Chocolate",
                "category": "Chocolate",
                "price": 15.99,
                "quantity": 20
            },
            {
                "name": "Budget Candy",
                "category": "Candy",
                "price": 2.99,
                "quantity": 50
            },
            {
                "name": "Premium Truffle",
                "category": "Chocolate",
                "price": 12.99,
                "quantity": 15
            }
        ]
        
        for sweet in sweets_data:
            response = client.post("/api/sweets", json=sweet, headers=admin_headers)
            assert response.status_code == status.HTTP_201_CREATED
        
        # Search by category
        response = client.post(
            "/api/sweets/search",
            json={"category": "Chocolate"},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        chocolates = response.json()["sweets"]
        assert all(s["category"] == "Chocolate" for s in chocolates)
        
        # Search by price range
        response = client.post(
            "/api/sweets/search",
            json={"min_price": 10.0, "max_price": 15.0},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        sweets = response.json()["sweets"]
        assert all(10.0 <= s["price"] <= 15.0 for s in sweets)
        
        # Search by name (partial match)
        response = client.post(
            "/api/sweets/search",
            json={"name": "Chocolate"},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        sweets = response.json()["sweets"]
        assert all("Chocolate" in s["name"] for s in sweets)


class TestErrorHandling:
    """Integration tests for error handling and edge cases."""
    
    def test_purchase_zero_quantity_item(self, client, auth_headers, admin_headers):
        """Test attempting to purchase item with zero quantity."""
        # Create sweet with zero quantity
        sweet_data = {
            "name": "Out of Stock Sweet",
            "category": "Test",
            "price": 5.99,
            "quantity": 0
        }
        
        response = client.post("/api/sweets", json=sweet_data, headers=admin_headers)
        sweet_id = response.json()["id"]
        
        # Attempt to purchase
        response = client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": 1},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_duplicate_sweet_creation(self, client, admin_headers, test_sweet):
        """Test attempting to create sweet with duplicate name."""
        duplicate_data = {
            "name": test_sweet.name,
            "category": "Test",
            "price": 5.99,
            "quantity": 10
        }
        
        response = client.post("/api/sweets", json=duplicate_data, headers=admin_headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_invalid_price_sweet_creation(self, client, admin_headers):
        """Test sweet creation with invalid price."""
        invalid_data = {
            "name": "Invalid Price Sweet",
            "category": "Test",
            "price": -5.99,  # Negative price
            "quantity": 10
        }
        
        response = client.post("/api/sweets", json=invalid_data, headers=admin_headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    
    def test_access_admin_endpoint_as_user(self, client, auth_headers, test_sweet_data):
        """Test regular user cannot access admin endpoints."""
        response = client.post(
            "/api/sweets",
            json=test_sweet_data,
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
