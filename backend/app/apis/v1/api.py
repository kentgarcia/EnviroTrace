# app/apis/v1/api.py
from fastapi import APIRouter
from .sapling_requests import router as sapling_requests_router
from .tree_inventory_router import router as tree_inventory_router
from .urban_greening_projects import router as urban_greening_projects_router
from . import auth_router, profile_router, emission_router, fee_router, test_schedules, tree_management_router, planting_router, admin_router, session_router
from .dashboard_router import router as dashboard_router
from .gemini_router import router as gemini_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(profile_router.router, prefix="/profile", tags=["Profile"])
api_v1_router.include_router(admin_router.router, prefix="/admin", tags=["Admin"])
api_v1_router.include_router(session_router.router, prefix="/admin", tags=["Session Management"])
# api_v1_router.include_router(users_router.router, prefix="/users", tags=["Users"])
api_v1_router.include_router(emission_router.router, prefix="/emission", tags=["Emission Data"])
api_v1_router.include_router(fee_router.router, prefix="/fees", tags=["Fee Management"])
api_v1_router.include_router(test_schedules.router, prefix="/test-schedules", tags=["Test Schedules"])
api_v1_router.include_router(tree_management_router.router, prefix="/tree-management", tags=["Tree Management"])
api_v1_router.include_router(planting_router.router, prefix="/planting", tags=["Planting Records"])
api_v1_router.include_router(tree_inventory_router)  # Tree Inventory System
api_v1_router.include_router(sapling_requests_router)
api_v1_router.include_router(urban_greening_projects_router, prefix="/urban-greening-projects", tags=["Urban Greening Projects"])
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(gemini_router, prefix="/gemini", tags=["Gemini AI"])
