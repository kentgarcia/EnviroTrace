# app/apis/v1/api.py
from fastapi import APIRouter
from .monitoring_requests import router as monitoring_requests_router
from .sapling_requests import router as sapling_requests_router
from . import auth_router, profile_router, emission_router, fee_router, test_schedules, tree_management_router, planting_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(profile_router.router, prefix="/profile", tags=["Profile"])
# api_v1_router.include_router(users_router.router, prefix="/users", tags=["Users"])
# api_v1_router.include_router(belching_router.router, prefix="/belching", tags=["Belching Data"])
api_v1_router.include_router(emission_router.router, prefix="/emission", tags=["Emission Data"])
api_v1_router.include_router(fee_router.router, prefix="/fees", tags=["Fee Management"])
api_v1_router.include_router(test_schedules.router, prefix="/test-schedules", tags=["Test Schedules"])
api_v1_router.include_router(tree_management_router.router, prefix="/tree-management", tags=["Tree Management"])
api_v1_router.include_router(planting_router.router, prefix="/planting", tags=["Planting Records"])
api_v1_router.include_router(monitoring_requests_router)
api_v1_router.include_router(sapling_requests_router)
