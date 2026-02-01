# app/db/base_class.py
from app.db.database import Base

# Import all your models here so that Base has them registered
# and Alembic can discover them.
from app.models.auth_models import User, Profile, UserRoleMapping, Role
from app.models.emission_models import Vehicle, VehicleDriverHistory, TestSchedule, Test
from app.models.urban_greening_models import FeeRecord
from app.models.urban_greening_models import SaplingRequest