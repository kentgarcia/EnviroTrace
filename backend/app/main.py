# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.apis.v1.api import api_v1_router
from app.db.database import engine, AsyncSessionLocal # For potential startup tasks
from app.db.utils import create_extensions # If you want to run it at startup

# Lifespan for startup/shutdown events (FastAPI's new way)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Application startup...")
    # Example: Create extensions if they don't exist.
    # async with AsyncSessionLocal() as session:
    #     await create_extensions(session)
    #     print("Database extensions checked/created.")
    
    yield # Application runs here

    # Shutdown
    print("Application shutdown...")
    if engine: # Check if engine was initialized
        await engine.dispose()
    print("Database connections closed.")


app = FastAPI(
    title="My Production-Ready API",
    openapi_url=f"/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Middleware
origins = settings.BACKEND_CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/api/healthcheck")
def healthcheck():
    return {"status": "ok"}