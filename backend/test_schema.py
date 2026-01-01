from pydantic import BaseModel
from datetime import date as DateType
from typing import Optional, Union
from decimal import Decimal

class UrbanGreeningFeeRecordUpdate(BaseModel):
    type: Optional[str] = None
    amount: Optional[Decimal] = None
    payer_name: Optional[str] = None
    date: Optional[DateType] = None
    due_date: Optional[DateType] = None
    status: Optional[str] = None
    payment_date: Optional[DateType] = None

# Test with the payload
test_payload = {
    "type": "cutting_permit",
    "amount": "1250.00",
    "payer_name": "Kent Glenn Villaroman",
    "date": "2025-12-26",
    "due_date": "2025-12-26",
    "status": "pending",
    "payment_date": "2025-12-27"
}

try:
    obj = UrbanGreeningFeeRecordUpdate(**test_payload)
    print("SUCCESS! Schema validation passed")
    print(f"Parsed object: {obj.model_dump()}")
except Exception as e:
    print(f"ERROR: {e}")
