# app/db/base_class.py
from app.db.database import Base

# Import all your models here so that Base has them registered
# and Alembic can discover them.
from app.models.auth_models import User, Profile, UserRoleMapping, UserRoleEnum
from app.models.belching_models import Fee, Driver, Record, Violation, RecordHistory
from app.models.emission_models import Vehicle, VehicleDriverHistory, TestSchedule, Test