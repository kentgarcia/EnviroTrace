import requests
import json
from datetime import date

# Test the Order of Payment API endpoints
BASE_URL = "http://localhost:8000"

# Test data
test_order = {
    "plate_number": "ABC123",
    "operator_name": "Test Operator Company",
    "driver_name": "John Doe",
    "selected_violations": "1,2,3",
    "testing_officer": "Officer Smith",
    "test_results": "Failed",
    "date_of_testing": "2025-01-15",
    "apprehension_fee": 150.00,
    "voluntary_fee": 100.00,
    "impound_fee": 500.00,
    "driver_amount": 1000.00,
    "operator_fee": 2000.00,
    "total_undisclosed_amount": 3750.00,
    "grand_total_amount": 3750.00,
    "payment_or_number": "OR-123456",
    "date_of_payment": str(date.today()),
    "status": "pending"
}

def test_create_order():
    print("Testing Create Order of Payment...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/air-quality/orders-of-payment",
            json=test_order,
            headers={"Content-Type": "application/json"}
        )
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.json()}")
        
        if response.status_code == 200:
            return response.json()
        else:
            print("Error creating order")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_search_orders():
    print("\nTesting Search Orders of Payment...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/air-quality/orders-of-payment/search",
            params={"search": "ABC123"}
        )
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Testing Order of Payment API endpoints...")
    print("=" * 50)
    
    # Test create
    created_order = test_create_order()
    
    # Test search
    test_search_orders()
    
    print("\nTest completed!")
