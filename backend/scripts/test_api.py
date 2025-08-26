#!/usr/bin/env python3

import asyncio
import json
from datetime import date
from app.schemas.tree_management_schemas import TreeManagementRequestCreate
from app.db.database import SessionLocal
from app.crud.crud_tree_management import tree_management_request

def test_create_request():
    # Test data without reason_for_request and attachment_files
    test_data = TreeManagementRequestCreate(
        request_number="TEST-001",
        request_type="pruning",
        requester_name="Test User",
        property_address="123 Test Street",
        status="filed",
        request_date=date.today(),
        notes="Test notes"
    )
    
    with SessionLocal() as db:
        try:
            # Delete existing test request if any
            existing = tree_management_request.get_by_request_number(db, request_number="TEST-001")
            if existing:
                tree_management_request.remove_sync(db, id=str(existing.id))
                print("Removed existing test request")
            
            # Create new request
            result = tree_management_request.create_sync(db=db, obj_in=test_data)
            print("Successfully created request:")
            print(f"ID: {result.id}")
            print(f"Request Number: {result.request_number}")
            print(f"Type: {result.request_type}")
            print(f"Requester: {result.requester_name}")
            print(f"Address: {result.property_address}")
            print(f"Status: {result.status}")
            print(f"Notes: {result.notes}")
            
            # Clean up
            tree_management_request.remove_sync(db, id=str(result.id))
            print("Test completed successfully and cleaned up!")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_create_request()
