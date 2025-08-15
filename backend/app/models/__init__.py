from .auth_models import User, Profile, UserRoleMapping # etc.
from .belching_models import Fee, Driver, Record # etc.
from .emission_models import Vehicle, Test # etc.
from .monitoring_request_models import MonitoringRequest
from .urban_greening_models import SaplingRequest

# Alternatively, create an app/db/base_class.py
# from app.db.database import Base
# from app.models.auth_models import *
# from app.models.belching_models import *
# from app.models.emission_models import *