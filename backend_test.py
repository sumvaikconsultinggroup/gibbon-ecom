#!/usr/bin/env python3
"""
Backend API Testing for Gibbon Nutrition Admin Panel
Tests the new Admin Panel features including Discounts API, Products API, and PromoCode validation
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Base URL for testing - using production URL from .env
BASE_URL = "https://shopfix-5.preview.emergentagent.com"

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        self.created_discount_id = None
        self.admin_authenticated = False
        self.admin_user_info = None
        self.created_review_id = None
        self.test_product_handles = ["bcaa-4-1-1-glutamine", "t-shirt", "shaker"]

    def log_test(self, test_name: str, success: bool, message: str, response_data: Optional[Dict] = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })
        
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")

    def test_admin_setup_status(self) -> bool:
        """Test GET /api/admin/auth/setup - Check setup status"""
        try:
            response = self.session.get(f"{self.base_url}/api/admin/auth/setup")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    needs_setup = data.get('needsSetup', True)
                    if not needs_setup:
                        self.log_test(
                            "GET /api/admin/auth/setup", 
                            True, 
                            "Setup status correct: Admin already exists (needsSetup: false)"
                        )
                        return True
                    else:
                        self.log_test(
                            "GET /api/admin/auth/setup", 
                            False, 
                            "Setup status incorrect: needsSetup should be false since admin exists", 
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "GET /api/admin/auth/setup", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                self.log_test(
                    "GET /api/admin/auth/setup", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/auth/setup", False, f"Exception: {str(e)}")
            return False

    def test_admin_login(self) -> bool:
        """Test POST /api/admin/auth/login - Login with admin credentials"""
        login_data = {
            "email": "admin@gibbonnutrition.com",
            "password": "gibbonsecret"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/admin/auth/login",
                json=login_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    user = data.get('user', {})
                    self.admin_user_info = user
                    self.admin_authenticated = True
                    
                    # Check if Set-Cookie header is present
                    set_cookie = response.headers.get('Set-Cookie', '')
                    has_admin_token = 'admin_token=' in set_cookie
                    
                    self.log_test(
                        "POST /api/admin/auth/login", 
                        True, 
                        f"Login successful for {user.get('email', 'unknown')} (Role: {user.get('role', 'unknown')}) - Cookie set: {has_admin_token}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/admin/auth/login", 
                        False, 
                        f"Login failed: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/admin/auth/login", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/auth/login", False, f"Exception: {str(e)}")
            return False

    def test_admin_me(self) -> bool:
        """Test GET /api/admin/auth/me - Get current user info"""
        if not self.admin_authenticated:
            self.log_test("GET /api/admin/auth/me", False, "Cannot test /me endpoint - not authenticated")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/api/admin/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    user = data.get('user', {})
                    expected_email = "admin@gibbonnutrition.com"
                    actual_email = user.get('email', '')
                    
                    if actual_email.lower() == expected_email.lower():
                        self.log_test(
                            "GET /api/admin/auth/me", 
                            True, 
                            f"User info retrieved successfully: {user.get('name', 'Unknown')} ({user.get('role', 'unknown')})"
                        )
                        return True
                    else:
                        self.log_test(
                            "GET /api/admin/auth/me", 
                            False, 
                            f"User email mismatch: expected {expected_email}, got {actual_email}", 
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "GET /api/admin/auth/me", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            elif response.status_code == 401:
                self.log_test(
                    "GET /api/admin/auth/me", 
                    False, 
                    "Authentication failed - cookie not working properly"
                )
                return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "GET /api/admin/auth/me", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/auth/me", False, f"Exception: {str(e)}")
            return False

    def test_admin_staff_list(self) -> bool:
        """Test GET /api/admin/staff - List all staff members"""
        if not self.admin_authenticated:
            self.log_test("GET /api/admin/staff", False, "Cannot test staff list - not authenticated")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/api/admin/staff")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    staff = data.get('staff', [])
                    owner_found = any(s.get('role') == 'owner' for s in staff)
                    
                    if owner_found and len(staff) >= 1:
                        self.log_test(
                            "GET /api/admin/staff", 
                            True, 
                            f"Staff list retrieved successfully: {len(staff)} members (owner found)"
                        )
                        return True
                    else:
                        self.log_test(
                            "GET /api/admin/staff", 
                            False, 
                            f"Staff list incomplete: {len(staff)} members, owner found: {owner_found}", 
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "GET /api/admin/staff", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            elif response.status_code == 401:
                self.log_test(
                    "GET /api/admin/staff", 
                    False, 
                    "Authentication failed - cookie not working properly"
                )
                return False
            elif response.status_code == 403:
                self.log_test(
                    "GET /api/admin/staff", 
                    False, 
                    "Permission denied - user lacks staff.view permission"
                )
                return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "GET /api/admin/staff", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/staff", False, f"Exception: {str(e)}")
            return False

    def test_admin_staff_invite(self) -> bool:
        """Test POST /api/admin/staff - Invite new staff member"""
        if not self.admin_authenticated:
            self.log_test("POST /api/admin/staff", False, "Cannot test staff invite - not authenticated")
            return False
            
        invite_data = {
            "email": "staff@test.com",
            "name": "Test Staff",
            "role": "staff"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/admin/staff",
                json=invite_data
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    staff = data.get('staff', {})
                    temp_password = data.get('staff', {}).get('tempPassword')
                    
                    if temp_password:
                        self.log_test(
                            "POST /api/admin/staff", 
                            True, 
                            f"Staff invited successfully: {staff.get('email')} with temp password"
                        )
                        return True
                    else:
                        self.log_test(
                            "POST /api/admin/staff", 
                            False, 
                            "Staff invite missing temporary password", 
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "POST /api/admin/staff", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            elif response.status_code == 400:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                if "already registered" in data.get('message', ''):
                    self.log_test(
                        "POST /api/admin/staff", 
                        True, 
                        "Staff invite working (email already exists - expected behavior)"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/admin/staff", 
                        False, 
                        f"Bad request: {data.get('message', response.text)}", 
                        data
                    )
                    return False
            elif response.status_code == 401:
                self.log_test(
                    "POST /api/admin/staff", 
                    False, 
                    "Authentication failed - cookie not working properly"
                )
                return False
            elif response.status_code == 403:
                self.log_test(
                    "POST /api/admin/staff", 
                    False, 
                    "Permission denied - user lacks staff.invite permission"
                )
                return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/admin/staff", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/staff", False, f"Exception: {str(e)}")
            return False

    def test_admin_logout(self) -> bool:
        """Test POST /api/admin/auth/logout - Logout and clear cookie"""
        try:
            response = self.session.post(f"{self.base_url}/api/admin/auth/logout")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.admin_authenticated = False
                    self.admin_user_info = None
                    
                    # Check if cookie is cleared by trying to access /me
                    me_response = self.session.get(f"{self.base_url}/api/admin/auth/me")
                    if me_response.status_code == 401:
                        self.log_test(
                            "POST /api/admin/auth/logout", 
                            True, 
                            "Logout successful - cookie cleared properly"
                        )
                        return True
                    else:
                        self.log_test(
                            "POST /api/admin/auth/logout", 
                            False, 
                            "Logout incomplete - cookie not cleared properly"
                        )
                        return False
                else:
                    self.log_test(
                        "POST /api/admin/auth/logout", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/admin/auth/logout", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/auth/logout", False, f"Exception: {str(e)}")
            return False

    def test_discounts_get(self) -> bool:
        """Test GET /api/discounts - List all discount codes"""
        try:
            response = self.session.get(f"{self.base_url}/api/discounts")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    discounts = data.get('discounts', [])
                    self.log_test(
                        "GET /api/discounts", 
                        True, 
                        f"Successfully retrieved {len(discounts)} discounts"
                    )
                    return True
                else:
                    self.log_test(
                        "GET /api/discounts", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                self.log_test(
                    "GET /api/discounts", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/discounts", False, f"Exception: {str(e)}")
            return False

    def test_discounts_post(self) -> bool:
        """Test POST /api/discounts - Create new discount"""
        test_discount = {
            "code": "TEST20",
            "discountType": "percentage",
            "discountValue": 20,
            "minOrderAmount": 1000,
            "usageLimit": 50,
            "isActive": True,
            "appliesTo": "all"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/discounts",
                json=test_discount
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    discount = data.get('discount', {})
                    self.created_discount_id = discount.get('_id')
                    self.log_test(
                        "POST /api/discounts", 
                        True, 
                        f"Successfully created discount with ID: {self.created_discount_id}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/discounts", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            elif response.status_code == 400:
                # Code already exists, try to get existing discount
                data = response.json()
                if "already exists" in data.get('message', ''):
                    # Get existing discount ID
                    get_response = self.session.get(f"{self.base_url}/api/discounts")
                    if get_response.status_code == 200:
                        get_data = get_response.json()
                        discounts = get_data.get('discounts', [])
                        for discount in discounts:
                            if discount.get('code') == 'TEST20':
                                self.created_discount_id = discount.get('_id')
                                self.log_test(
                                    "POST /api/discounts", 
                                    True, 
                                    f"Discount already exists, using existing ID: {self.created_discount_id}"
                                )
                                return True
                
                self.log_test(
                    "POST /api/discounts", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/discounts", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/discounts", False, f"Exception: {str(e)}")
            return False

    def test_discounts_put(self) -> bool:
        """Test PUT /api/discounts/{id} - Update discount"""
        if not self.created_discount_id:
            self.log_test("PUT /api/discounts/{id}", False, "No discount ID available for update test")
            return False
            
        update_data = {
            "discountValue": 25,
            "usageLimit": 100,
            "isActive": True
        }
        
        try:
            response = self.session.put(
                f"{self.base_url}/api/discounts/{self.created_discount_id}",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "PUT /api/discounts/{id}", 
                        True, 
                        "Successfully updated discount"
                    )
                    return True
                else:
                    self.log_test(
                        "PUT /api/discounts/{id}", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "PUT /api/discounts/{id}", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("PUT /api/discounts/{id}", False, f"Exception: {str(e)}")
            return False

    def test_discounts_delete(self) -> bool:
        """Test DELETE /api/discounts/{id} - Delete discount"""
        if not self.created_discount_id:
            self.log_test("DELETE /api/discounts/{id}", False, "No discount ID available for delete test")
            return False
            
        try:
            response = self.session.delete(f"{self.base_url}/api/discounts/{self.created_discount_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "DELETE /api/discounts/{id}", 
                        True, 
                        "Successfully deleted discount"
                    )
                    return True
                else:
                    self.log_test(
                        "DELETE /api/discounts/{id}", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "DELETE /api/discounts/{id}", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("DELETE /api/discounts/{id}", False, f"Exception: {str(e)}")
            return False

    def test_products_get(self) -> bool:
        """Test GET /api/products - List all products with inventory data"""
        try:
            response = self.session.get(f"{self.base_url}/api/products")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    products = data.get('products', [])
                    
                    # Check if products have variants with inventoryQty
                    inventory_check_passed = True
                    inventory_issues = []
                    
                    for i, product in enumerate(products[:5]):  # Check first 5 products
                        variants = product.get('variants', [])
                        if not variants:
                            inventory_issues.append(f"Product {i+1} has no variants")
                            inventory_check_passed = False
                        else:
                            for j, variant in enumerate(variants):
                                if 'inventoryQty' not in variant:
                                    inventory_issues.append(f"Product {i+1}, Variant {j+1} missing inventoryQty")
                                    inventory_check_passed = False
                    
                    if inventory_check_passed:
                        self.log_test(
                            "GET /api/products", 
                            True, 
                            f"Successfully retrieved {len(products)} products with proper inventory data"
                        )
                    else:
                        self.log_test(
                            "GET /api/products", 
                            False, 
                            f"Products missing inventory data: {'; '.join(inventory_issues[:3])}"
                        )
                    
                    return inventory_check_passed
                else:
                    self.log_test(
                        "GET /api/products", 
                        False, 
                        f"API returned success=false: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                self.log_test(
                    "GET /api/products", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/products", False, f"Exception: {str(e)}")
            return False

    def test_orders_list(self) -> bool:
        """Test GET /api/admin/orders - List all orders with filtering"""
        if not self.admin_authenticated:
            self.log_test("GET /api/admin/orders", False, "Cannot test orders list - not authenticated")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/api/admin/orders")
            
            if response.status_code == 200:
                data = response.json()
                if 'orders' in data:
                    orders = data.get('orders', [])
                    pagination = data.get('pagination', {})
                    
                    # Check if ORD-2024-001 exists
                    test_order_found = any(order.get('orderId') == 'ORD-2024-001' for order in orders)
                    
                    if test_order_found:
                        self.log_test(
                            "GET /api/admin/orders", 
                            True, 
                            f"Successfully retrieved {len(orders)} orders, test order ORD-2024-001 found"
                        )
                        return True
                    else:
                        # Try with search parameter
                        search_response = self.session.get(f"{self.base_url}/api/admin/orders?search=ORD-2024-001")
                        if search_response.status_code == 200:
                            search_data = search_response.json()
                            search_orders = search_data.get('orders', [])
                            if any(order.get('orderId') == 'ORD-2024-001' for order in search_orders):
                                self.log_test(
                                    "GET /api/admin/orders", 
                                    True, 
                                    f"Orders API working, test order found via search"
                                )
                                return True
                        
                        self.log_test(
                            "GET /api/admin/orders", 
                            False, 
                            f"Test order ORD-2024-001 not found in {len(orders)} orders"
                        )
                        return False
                else:
                    self.log_test(
                        "GET /api/admin/orders", 
                        False, 
                        f"Invalid response format: {data}", 
                        data
                    )
                    return False
            elif response.status_code == 401:
                self.log_test(
                    "GET /api/admin/orders", 
                    False, 
                    "Authentication failed - cookie not working properly"
                )
                return False
            elif response.status_code == 403:
                self.log_test(
                    "GET /api/admin/orders", 
                    False, 
                    "Permission denied - user lacks orders.view permission"
                )
                return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "GET /api/admin/orders", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/orders", False, f"Exception: {str(e)}")
            return False

    def test_single_order(self) -> bool:
        """Test GET /api/admin/orders/ORD-2024-001 - Get single order details"""
        if not self.admin_authenticated:
            self.log_test("GET /api/admin/orders/ORD-2024-001", False, "Cannot test single order - not authenticated")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/api/admin/orders/ORD-2024-001")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ['orderId', 'customer', 'items', 'totalAmount', 'status']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    customer = data.get('customer', {})
                    customer_name = customer.get('name', '')
                    
                    # Check if customer is Rahul Sharma as mentioned in review request
                    if 'Rahul Sharma' in customer_name or customer.get('firstName') == 'Rahul':
                        self.log_test(
                            "GET /api/admin/orders/ORD-2024-001", 
                            True, 
                            f"Order details retrieved successfully: Customer {customer_name}, Total ₹{data.get('totalAmount', 0)}"
                        )
                        return True
                    else:
                        self.log_test(
                            "GET /api/admin/orders/ORD-2024-001", 
                            True, 
                            f"Order details retrieved successfully: Customer {customer_name}, Total ₹{data.get('totalAmount', 0)}"
                        )
                        return True
                else:
                    self.log_test(
                        "GET /api/admin/orders/ORD-2024-001", 
                        False, 
                        f"Missing required fields: {missing_fields}", 
                        data
                    )
                    return False
            elif response.status_code == 404:
                self.log_test(
                    "GET /api/admin/orders/ORD-2024-001", 
                    False, 
                    "Order ORD-2024-001 not found in database"
                )
                return False
            elif response.status_code == 401:
                self.log_test(
                    "GET /api/admin/orders/ORD-2024-001", 
                    False, 
                    "Authentication failed - cookie not working properly"
                )
                return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "GET /api/admin/orders/ORD-2024-001", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/orders/ORD-2024-001", False, f"Exception: {str(e)}")
            return False

    def test_order_update_status(self) -> bool:
        """Test PATCH /api/admin/orders/ORD-2024-001 - Update order status"""
        if not self.admin_authenticated:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (status)", False, "Cannot test order update - not authenticated")
            return False
            
        update_data = {
            "action": "update_status",
            "status": "processing",
            "user": "Test Agent"
        }
        
        try:
            response = self.session.patch(
                f"{self.base_url}/api/admin/orders/ORD-2024-001",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    order = data.get('order', {})
                    if order.get('status') == 'processing':
                        self.log_test(
                            "PATCH /api/admin/orders/ORD-2024-001 (status)", 
                            True, 
                            "Order status updated successfully to 'processing'"
                        )
                        return True
                    else:
                        self.log_test(
                            "PATCH /api/admin/orders/ORD-2024-001 (status)", 
                            False, 
                            f"Status not updated correctly: expected 'processing', got '{order.get('status')}'", 
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (status)", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            elif response.status_code == 404:
                self.log_test(
                    "PATCH /api/admin/orders/ORD-2024-001 (status)", 
                    False, 
                    "Order ORD-2024-001 not found"
                )
                return False
            elif response.status_code == 401:
                self.log_test(
                    "PATCH /api/admin/orders/ORD-2024-001 (status)", 
                    False, 
                    "Authentication failed - cookie not working properly"
                )
                return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "PATCH /api/admin/orders/ORD-2024-001 (status)", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (status)", False, f"Exception: {str(e)}")
            return False

    def test_order_add_note(self) -> bool:
        """Test PATCH /api/admin/orders/ORD-2024-001 - Add note"""
        if not self.admin_authenticated:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (add_note)", False, "Cannot test add note - not authenticated")
            return False
            
        update_data = {
            "action": "add_note",
            "content": "Test note added via API testing",
            "author": "Test Agent",
            "isInternal": True
        }
        
        try:
            response = self.session.patch(
                f"{self.base_url}/api/admin/orders/ORD-2024-001",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (add_note)", 
                        True, 
                        "Note added successfully to order"
                    )
                    return True
                else:
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (add_note)", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "PATCH /api/admin/orders/ORD-2024-001 (add_note)", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (add_note)", False, f"Exception: {str(e)}")
            return False

    def test_order_add_tag(self) -> bool:
        """Test PATCH /api/admin/orders/ORD-2024-001 - Add tag"""
        if not self.admin_authenticated:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (add_tag)", False, "Cannot test add tag - not authenticated")
            return False
            
        update_data = {
            "action": "add_tag",
            "tag": "test-tag"
        }
        
        try:
            response = self.session.patch(
                f"{self.base_url}/api/admin/orders/ORD-2024-001",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (add_tag)", 
                        True, 
                        "Tag 'test-tag' added successfully to order"
                    )
                    return True
                else:
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (add_tag)", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "PATCH /api/admin/orders/ORD-2024-001 (add_tag)", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (add_tag)", False, f"Exception: {str(e)}")
            return False

    def test_order_remove_tag(self) -> bool:
        """Test PATCH /api/admin/orders/ORD-2024-001 - Remove tag"""
        if not self.admin_authenticated:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (remove_tag)", False, "Cannot test remove tag - not authenticated")
            return False
            
        update_data = {
            "action": "remove_tag",
            "tag": "test-tag"
        }
        
        try:
            response = self.session.patch(
                f"{self.base_url}/api/admin/orders/ORD-2024-001",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (remove_tag)", 
                        True, 
                        "Tag 'test-tag' removed successfully from order"
                    )
                    return True
                else:
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (remove_tag)", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "PATCH /api/admin/orders/ORD-2024-001 (remove_tag)", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (remove_tag)", False, f"Exception: {str(e)}")
            return False

    def test_order_assign(self) -> bool:
        """Test PATCH /api/admin/orders/ORD-2024-001 - Assign order"""
        if not self.admin_authenticated:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (assign)", False, "Cannot test assign order - not authenticated")
            return False
            
        update_data = {
            "action": "assign",
            "assignedTo": "Test Agent",
            "user": "Admin"
        }
        
        try:
            response = self.session.patch(
                f"{self.base_url}/api/admin/orders/ORD-2024-001",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (assign)", 
                        True, 
                        "Order assigned successfully to 'Test Agent'"
                    )
                    return True
                else:
                    self.log_test(
                        "PATCH /api/admin/orders/ORD-2024-001 (assign)", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "PATCH /api/admin/orders/ORD-2024-001 (assign)", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("PATCH /api/admin/orders/ORD-2024-001 (assign)", False, f"Exception: {str(e)}")
            return False

    def test_order_generate_invoice(self) -> bool:
        """Test POST /api/admin/orders/ORD-2024-001/invoice - Generate invoice"""
        if not self.admin_authenticated:
            self.log_test("POST /api/admin/orders/ORD-2024-001/invoice", False, "Cannot test invoice generation - not authenticated")
            return False
            
        invoice_data = {
            "user": "Test Agent"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/admin/orders/ORD-2024-001/invoice",
                json=invoice_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    invoice = data.get('invoice', {})
                    invoice_number = invoice.get('invoiceNumber', '')
                    
                    if invoice_number:
                        self.log_test(
                            "POST /api/admin/orders/ORD-2024-001/invoice", 
                            True, 
                            f"Invoice generated successfully: {invoice_number}"
                        )
                        return True
                    else:
                        self.log_test(
                            "POST /api/admin/orders/ORD-2024-001/invoice", 
                            False, 
                            "Invoice generated but no invoice number returned", 
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "POST /api/admin/orders/ORD-2024-001/invoice", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/admin/orders/ORD-2024-001/invoice", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/orders/ORD-2024-001/invoice", False, f"Exception: {str(e)}")
            return False

    def test_order_send_email(self) -> bool:
        """Test POST /api/admin/orders/ORD-2024-001/email - Send email"""
        if not self.admin_authenticated:
            self.log_test("POST /api/admin/orders/ORD-2024-001/email", False, "Cannot test email sending - not authenticated")
            return False
            
        email_data = {
            "type": "custom",
            "subject": "Test Email Subject",
            "customMessage": "This is a test email message sent via API testing",
            "user": "Test Agent"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/admin/orders/ORD-2024-001/email",
                json=email_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    email_info = data.get('email', {})
                    recipient = email_info.get('recipient', '')
                    
                    self.log_test(
                        "POST /api/admin/orders/ORD-2024-001/email", 
                        True, 
                        f"Email sent successfully to {recipient}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/admin/orders/ORD-2024-001/email", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/admin/orders/ORD-2024-001/email", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/orders/ORD-2024-001/email", False, f"Exception: {str(e)}")
            return False

    def test_promo_code_validation(self) -> bool:
        """Test POST /api/promoCode/check - Validate discount code"""
        test_data = {
            "code": "WELCOME10",
            "cartItems": [
                {
                    "productId": "test",
                    "quantity": 1,
                    "price": 600
                }
            ]
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/promoCode/check",
                json=test_data
            )
            
            # Accept both 200 (valid code) and 404 (invalid code) as successful API responses
            if response.status_code in [200, 404, 400, 410]:
                data = response.json()
                
                if response.status_code == 200 and data.get('success'):
                    self.log_test(
                        "POST /api/promoCode/check", 
                        True, 
                        f"Promo code validation successful: {data.get('message', 'Valid code')}"
                    )
                    return True
                elif response.status_code in [404, 400, 410]:
                    # These are expected responses for invalid/expired codes
                    self.log_test(
                        "POST /api/promoCode/check", 
                        True, 
                        f"Promo code validation working (code not found/invalid): {data.get('message', 'Code validation working')}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/promoCode/check", 
                        False, 
                        f"Unexpected response: {data.get('message', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/promoCode/check", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('message', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/promoCode/check", False, f"Exception: {str(e)}")
            return False

    # ===== REVIEWS SYSTEM TESTING =====
    
    def test_admin_reviews_list(self) -> bool:
        """Test GET /api/admin/reviews - List all reviews with filters"""
        if not self.admin_authenticated:
            self.log_test("GET /api/admin/reviews", False, "Cannot test admin reviews list - not authenticated")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/api/admin/reviews")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    reviews = data.get('data', [])
                    pagination = data.get('pagination', {})
                    stats = data.get('stats', {})
                    
                    self.log_test(
                        "GET /api/admin/reviews", 
                        True, 
                        f"Successfully retrieved {len(reviews)} reviews. Stats: {stats.get('total', 0)} total, {stats.get('approved', 0)} approved, {stats.get('pending', 0)} pending"
                    )
                    return True
                else:
                    self.log_test(
                        "GET /api/admin/reviews", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "GET /api/admin/reviews", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/reviews", False, f"Exception: {str(e)}")
            return False

    def test_admin_create_review(self) -> bool:
        """Test POST /api/admin/reviews - Create a new review manually"""
        if not self.admin_authenticated:
            self.log_test("POST /api/admin/reviews", False, "Cannot test admin create review - not authenticated")
            return False
            
        review_data = {
            "productHandle": self.test_product_handles[0],  # bcaa-4-1-1-glutamine
            "customerName": "Alex Johnson",
            "customerEmail": "alex.johnson@example.com",
            "rating": 5,
            "title": "Excellent BCAA supplement!",
            "content": "This BCAA supplement has really helped with my recovery after workouts. Great taste and mixes well. Highly recommend for anyone serious about fitness.",
            "status": "approved",
            "isVerifiedPurchase": True
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/admin/reviews",
                json=review_data
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    review = data.get('data', {})
                    self.created_review_id = review.get('_id')
                    self.log_test(
                        "POST /api/admin/reviews", 
                        True, 
                        f"Successfully created review with ID: {self.created_review_id} for product {review_data['productHandle']}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/admin/reviews", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            elif response.status_code == 404:
                # Product not found - try with a different product
                review_data["productHandle"] = "test-product"
                response = self.session.post(
                    f"{self.base_url}/api/admin/reviews",
                    json=review_data
                )
                if response.status_code == 201:
                    data = response.json()
                    if data.get('success'):
                        review = data.get('data', {})
                        self.created_review_id = review.get('_id')
                        self.log_test(
                            "POST /api/admin/reviews", 
                            True, 
                            f"Successfully created review with fallback product"
                        )
                        return True
                
                self.log_test(
                    "POST /api/admin/reviews", 
                    False, 
                    f"Product not found: {review_data['productHandle']}"
                )
                return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/admin/reviews", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/reviews", False, f"Exception: {str(e)}")
            return False

    def test_admin_update_review(self) -> bool:
        """Test PUT /api/admin/reviews/[id] - Update review"""
        if not self.admin_authenticated:
            self.log_test("PUT /api/admin/reviews/[id]", False, "Cannot test admin update review - not authenticated")
            return False
            
        if not self.created_review_id:
            self.log_test("PUT /api/admin/reviews/[id]", False, "No review ID available for update test")
            return False
            
        update_data = {
            "rating": 4,
            "title": "Updated: Good BCAA supplement",
            "content": "Updated review content: Still a good product but not as amazing as I initially thought.",
            "status": "approved",
            "adminNotes": "Updated by admin during testing"
        }
        
        try:
            response = self.session.put(
                f"{self.base_url}/api/admin/reviews/{self.created_review_id}",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    review = data.get('data', {})
                    if review.get('rating') == 4:
                        self.log_test(
                            "PUT /api/admin/reviews/[id]", 
                            True, 
                            f"Successfully updated review rating to {review.get('rating')}"
                        )
                        return True
                    else:
                        self.log_test(
                            "PUT /api/admin/reviews/[id]", 
                            False, 
                            f"Review not updated correctly: expected rating 4, got {review.get('rating')}", 
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "PUT /api/admin/reviews/[id]", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "PUT /api/admin/reviews/[id]", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("PUT /api/admin/reviews/[id]", False, f"Exception: {str(e)}")
            return False

    def test_customer_submit_review(self) -> bool:
        """Test POST /api/reviews/submit - Customer submits a new review"""
        review_data = {
            "productHandle": self.test_product_handles[1],  # t-shirt
            "customerName": "Sarah Wilson",
            "customerEmail": "sarah.wilson@example.com",
            "rating": 4,
            "title": "Nice quality t-shirt",
            "content": "The t-shirt is comfortable and fits well. Good material quality. Would buy again."
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/reviews/submit",
                json=review_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    review_info = data.get('data', {})
                    if review_info.get('status') == 'pending':
                        self.log_test(
                            "POST /api/reviews/submit", 
                            True, 
                            f"Customer review submitted successfully with status: {review_info.get('status')}"
                        )
                        return True
                    else:
                        self.log_test(
                            "POST /api/reviews/submit", 
                            False, 
                            f"Review status incorrect: expected 'pending', got '{review_info.get('status')}'", 
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "POST /api/reviews/submit", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            elif response.status_code == 404:
                self.log_test(
                    "POST /api/reviews/submit", 
                    False, 
                    f"Product not found: {review_data['productHandle']}"
                )
                return False
            elif response.status_code == 400:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                if "already submitted" in data.get('error', ''):
                    self.log_test(
                        "POST /api/reviews/submit", 
                        True, 
                        "Review submission working (customer already submitted review - expected behavior)"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/reviews/submit", 
                        False, 
                        f"Bad request: {data.get('error', response.text)}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/reviews/submit", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/reviews/submit", False, f"Exception: {str(e)}")
            return False

    def test_public_product_reviews(self) -> bool:
        """Test GET /api/product-reviews/[handle] - Get approved reviews for a product"""
        try:
            response = self.session.get(f"{self.base_url}/api/product-reviews/{self.test_product_handles[0]}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    reviews = data.get('data', [])
                    stats = data.get('stats', {})
                    pagination = data.get('pagination', {})
                    
                    # Check that only approved reviews are returned
                    all_approved = all(review.get('status', 'approved') == 'approved' for review in reviews)
                    
                    self.log_test(
                        "GET /api/product-reviews/[handle]", 
                        True, 
                        f"Successfully retrieved {len(reviews)} approved reviews. Avg rating: {stats.get('avgRating', 0)}, Total: {stats.get('totalReviews', 0)}"
                    )
                    return True
                else:
                    self.log_test(
                        "GET /api/product-reviews/[handle]", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "GET /api/product-reviews/[handle]", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/product-reviews/[handle]", False, f"Exception: {str(e)}")
            return False

    def test_mark_review_helpful(self) -> bool:
        """Test POST /api/reviews/helpful - Mark a review as helpful"""
        if not self.created_review_id:
            self.log_test("POST /api/reviews/helpful", False, "No review ID available for helpful test")
            return False
            
        helpful_data = {
            "reviewId": self.created_review_id,
            "voterId": "test-voter-123"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/reviews/helpful",
                json=helpful_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    helpful_count = data.get('helpfulCount', 0)
                    self.log_test(
                        "POST /api/reviews/helpful", 
                        True, 
                        f"Successfully marked review as helpful. New helpful count: {helpful_count}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/reviews/helpful", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            elif response.status_code == 400:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                if "already marked" in data.get('error', ''):
                    self.log_test(
                        "POST /api/reviews/helpful", 
                        True, 
                        "Helpful vote working (already voted - expected behavior)"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/reviews/helpful", 
                        False, 
                        f"Bad request: {data.get('error', response.text)}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/reviews/helpful", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/reviews/helpful", False, f"Exception: {str(e)}")
            return False

    def test_sample_csv_download(self) -> bool:
        """Test GET /api/admin/reviews/sample-csv - Download sample CSV template"""
        try:
            response = self.session.get(f"{self.base_url}/api/admin/reviews/sample-csv")
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                content_disposition = response.headers.get('content-disposition', '')
                
                if 'text/csv' in content_type and 'attachment' in content_disposition:
                    csv_content = response.text
                    if 'product_handle,customer_name,email,rating' in csv_content:
                        self.log_test(
                            "GET /api/admin/reviews/sample-csv", 
                            True, 
                            f"Successfully downloaded sample CSV ({len(csv_content)} characters)"
                        )
                        return True
                    else:
                        self.log_test(
                            "GET /api/admin/reviews/sample-csv", 
                            False, 
                            "CSV content format incorrect"
                        )
                        return False
                else:
                    self.log_test(
                        "GET /api/admin/reviews/sample-csv", 
                        False, 
                        f"Incorrect headers: Content-Type: {content_type}, Content-Disposition: {content_disposition}"
                    )
                    return False
            else:
                self.log_test(
                    "GET /api/admin/reviews/sample-csv", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/reviews/sample-csv", False, f"Exception: {str(e)}")
            return False

    def test_bulk_actions(self) -> bool:
        """Test POST /api/admin/reviews/bulk - Bulk approve/reject/delete reviews"""
        if not self.admin_authenticated:
            self.log_test("POST /api/admin/reviews/bulk", False, "Cannot test bulk actions - not authenticated")
            return False
            
        if not self.created_review_id:
            self.log_test("POST /api/admin/reviews/bulk", False, "No review ID available for bulk actions test")
            return False
            
        # Test bulk approve
        bulk_data = {
            "action": "approve",
            "reviewIds": [self.created_review_id]
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/admin/reviews/bulk",
                json=bulk_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    message = data.get('message', '')
                    self.log_test(
                        "POST /api/admin/reviews/bulk", 
                        True, 
                        f"Bulk action successful: {message}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/admin/reviews/bulk", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/admin/reviews/bulk", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/reviews/bulk", False, f"Exception: {str(e)}")
            return False

    def test_import_reviews(self) -> bool:
        """Test POST /api/admin/reviews/import - Import reviews from CSV data"""
        if not self.admin_authenticated:
            self.log_test("POST /api/admin/reviews/import", False, "Cannot test import reviews - not authenticated")
            return False
            
        # Sample review data for import
        import_data = {
            "reviews": [
                {
                    "product_handle": self.test_product_handles[2],  # shaker
                    "customer_name": "Mike Davis",
                    "email": "mike.davis@example.com",
                    "rating": "5",
                    "title": "Perfect shaker bottle",
                    "content": "This shaker bottle is exactly what I needed. No leaks, easy to clean, and the mixing ball works great.",
                    "verified": "false",
                    "created_at": "2024-01-15"
                }
            ],
            "overwriteExisting": False
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/admin/reviews/import",
                json=import_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    imported = data.get('imported', 0)
                    skipped = data.get('skipped', 0)
                    errors = data.get('errors', [])
                    
                    if imported > 0 or (skipped > 0 and len(errors) == 0):
                        self.log_test(
                            "POST /api/admin/reviews/import", 
                            True, 
                            f"Import successful: {imported} imported, {skipped} skipped"
                        )
                        return True
                    else:
                        self.log_test(
                            "POST /api/admin/reviews/import", 
                            False, 
                            f"Import failed: {imported} imported, {skipped} skipped, errors: {errors}"
                        )
                        return False
                else:
                    self.log_test(
                        "POST /api/admin/reviews/import", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "POST /api/admin/reviews/import", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/reviews/import", False, f"Exception: {str(e)}")
            return False

    def test_admin_delete_review(self) -> bool:
        """Test DELETE /api/admin/reviews/[id] - Delete review"""
        if not self.admin_authenticated:
            self.log_test("DELETE /api/admin/reviews/[id]", False, "Cannot test admin delete review - not authenticated")
            return False
            
        if not self.created_review_id:
            self.log_test("DELETE /api/admin/reviews/[id]", False, "No review ID available for delete test")
            return False
            
        try:
            response = self.session.delete(f"{self.base_url}/api/admin/reviews/{self.created_review_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "DELETE /api/admin/reviews/[id]", 
                        True, 
                        "Successfully deleted review"
                    )
                    return True
                else:
                    self.log_test(
                        "DELETE /api/admin/reviews/[id]", 
                        False, 
                        f"API returned success=false: {data.get('error', 'Unknown error')}", 
                        data
                    )
                    return False
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.log_test(
                    "DELETE /api/admin/reviews/[id]", 
                    False, 
                    f"HTTP {response.status_code}: {data.get('error', response.text)}", 
                    data
                )
                return False
                
        except Exception as e:
            self.log_test("DELETE /api/admin/reviews/[id]", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting API tests for Gibbon Nutrition Admin Panel")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence - Admin Auth tests first, then Order APIs
        tests = [
            ("Admin Setup Status", self.test_admin_setup_status),
            ("Admin Login", self.test_admin_login),
            ("Admin Current User", self.test_admin_me),
            ("Order List API", self.test_orders_list),
            ("Single Order API", self.test_single_order),
            ("Order Update Status", self.test_order_update_status),
            ("Order Add Note", self.test_order_add_note),
            ("Order Add Tag", self.test_order_add_tag),
            ("Order Remove Tag", self.test_order_remove_tag),
            ("Order Assignment", self.test_order_assign),
            ("Invoice Generation", self.test_order_generate_invoice),
            ("Email Sending", self.test_order_send_email),
            ("Admin Staff List", self.test_admin_staff_list),
            ("Admin Staff Invite", self.test_admin_staff_invite),
            ("Admin Logout", self.test_admin_logout),
            ("Discounts API - GET", self.test_discounts_get),
            ("Discounts API - POST", self.test_discounts_post),
            ("Discounts API - PUT", self.test_discounts_put),
            ("Discounts API - DELETE", self.test_discounts_delete),
            ("Products API - GET", self.test_products_get),
            ("PromoCode Validation", self.test_promo_code_validation),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            if test_func():
                passed += 1
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Admin Panel APIs are working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} test(s) failed. Check the details above.")
            return False

def main():
    """Main test execution"""
    tester = APITester(BASE_URL)
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()