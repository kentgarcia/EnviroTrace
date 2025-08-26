#!/usr/bin/env python3
"""
Simple test for Tree Management API
"""

import requests

def test_tree_management_api():
    base_url = "http://localhost:8000"
    endpoint = f"{base_url}/api/v1/tree-management/"
    
    try:
        print("Testing Tree Management API...")
        response = requests.get(endpoint)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API working! Found {len(data)} tree management requests")
            
            # Show first few requests
            for i, request in enumerate(data[:3]):
                print(f"  {i+1}. {request.get('request_number')} - {request.get('request_type')} - {request.get('status')}")
                
        else:
            print(f"❌ API error: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the backend server running?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_tree_management_api()
