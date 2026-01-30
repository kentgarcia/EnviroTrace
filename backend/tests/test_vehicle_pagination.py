import uuid
from datetime import datetime, timezone
from typing import Optional

import pytest

from app.crud.crud_emission import CRUDVehicle
from app.models.emission_models import Vehicle


def _build_vehicle(created_at: Optional[datetime] = None) -> Vehicle:
    vehicle = Vehicle()
    vehicle.id = uuid.uuid4()
    vehicle.created_at = created_at or datetime.now(timezone.utc)
    return vehicle


def test_vehicle_cursor_roundtrip() -> None:
    crud = CRUDVehicle(Vehicle)
    vehicle = _build_vehicle()

    cursor = crud._encode_vehicle_cursor(vehicle)
    decoded_created_at, decoded_id = crud._decode_vehicle_cursor(cursor)

    assert decoded_id == vehicle.id
    assert decoded_created_at == vehicle.created_at


def test_decode_invalid_cursor_raises_value_error() -> None:
    crud = CRUDVehicle(Vehicle)

    with pytest.raises(ValueError):
        crud._decode_vehicle_cursor("invalid cursor")


def test_sanitize_limit_bounds() -> None:
    crud = CRUDVehicle(Vehicle)

    assert crud._sanitize_limit(None) == crud._DEFAULT_LIMIT
    assert crud._sanitize_limit(0) == 1
    assert crud._sanitize_limit(crud._MAX_LIMIT + 50) == crud._MAX_LIMIT
