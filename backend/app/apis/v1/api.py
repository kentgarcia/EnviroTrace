# app/apis/v1/api.py
from fastapi import APIRouter
from . import auth_router, profile_router, emission_router, fee_router, test_schedules

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(profile_router.router, prefix="/profile", tags=["Profile"])
# api_v1_router.include_router(users_router.router, prefix="/users", tags=["Users"])
# api_v1_router.include_router(belching_router.router, prefix="/belching", tags=["Belching Data"])
api_v1_router.include_router(emission_router.router, prefix="/emission", tags=["Emission Data"])
api_v1_router.include_router(fee_router.router, prefix="/fees", tags=["Fee Management"])
api_v1_router.include_router(test_schedules.router, prefix="/test-schedules", tags=["Test Schedules"])