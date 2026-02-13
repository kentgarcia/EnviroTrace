# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.apis.v1.api import api_v1_router
from app.db.database import engine

from app.middleware.cors_exception_handler import CORSExceptionMiddleware
from app.middleware.audit_middleware import AuditLoggingMiddleware

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
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Middleware
origins = settings.BACKEND_CORS_ORIGINS
localhost_origins = [
    "http://localhost:8080",
    "https://localhost:8080",
    "http://127.0.0.1:8080",
    "https://127.0.0.1:8080",
]
for origin in localhost_origins:
    if origin not in origins:
        origins.append(origin)
print(f"Configured CORS origins: {origins}")

# Add our custom CORS exception middleware first
app.add_middleware(CORSExceptionMiddleware)

# Add the standard CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"(https?://(localhost|127\.0\.0\.1|tauri\.localhost)(:\d+)?)|(tauri://localhost)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global audit logging middleware - must wrap business handlers
app.add_middleware(AuditLoggingMiddleware)

app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/api/healthcheck")
def healthcheck():
    return {"status": "ok"}