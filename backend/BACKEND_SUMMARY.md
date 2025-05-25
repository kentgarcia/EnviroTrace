This document provides a comprehensive overview of the backend folder for this project. It is intended as a data bank for agentic AI and developers.

---

## Overview

The backend is a Python-based web API built with FastAPI, using SQLAlchemy for ORM, Alembic for migrations, and async support. It is structured for modularity, scalability, and production-readiness.

---

## Main Structure

- **app/**: Main application code (FastAPI app, business logic, models, APIs, etc.)
- **alembic/**: Database migration scripts and configuration (Alembic)
- **scripts/**: Utility scripts for development and setup
- **requirements.txt**: Python dependencies
- **README.md**: Quickstart and run instructions

---

## app/ Directory

- **main.py**: FastAPI entry point. Sets up the app, CORS, routers, and healthcheck endpoint. Uses async lifespan for startup/shutdown events.
- **core/**: App configuration and security utilities (e.g., config.py, security.py)
- **models/**: SQLAlchemy models for database tables (e.g., users, emissions, belching, auth)
- **schemas/**: Pydantic schemas for request/response validation (e.g., emission_schemas.py, user_schemas.py)
- **crud/**: CRUD logic for interacting with models (e.g., crud_emission.py, crud_user.py)
- **services/**: Business logic and service layer (e.g., auth_service.py)
- **apis/**: API routers and dependencies
  - **v1/**: Versioned API routers (e.g., emission_router.py, profile_router.py, auth_router.py)
- **db/**: Database session, base class, and utility functions
- **middleware/**: Custom middleware (e.g., CORS exception handler)

---

## Database & Migrations

- **alembic/**: Alembic configuration for migrations
  - **env.py**: Loads app settings, sets up schemas, and runs migrations
  - **versions/**: Migration scripts (e.g., initial schema based on Prisma models)
  - **README**: Single-database configuration
- **models/**: Defines tables for users, emissions, belching, etc.
- **crud/**: Encapsulates DB operations

---

## API

- **FastAPI**: Main framework
- **Routers**: Organized by resource (emission, profile, auth, users, belching)
- **OpenAPI**: Docs at `/api/docs` and `/api/redoc`
- **Healthcheck**: `/api/healthcheck` endpoint

---

## Scripts

- **scripts/README.md**: Explains utility scripts
- **create_admin_user.py**: Creates an admin user for dev/testing
- **setup_admin.sh/.bat**: Shell/batch scripts to automate admin setup

---

## Configuration & Dependencies

- **requirements.txt**: Lists all Python dependencies (FastAPI, SQLAlchemy, Alembic, asyncpg, etc.)
- **alembic.ini**: Alembic config
- **.venv/**: Virtual environment (not source-controlled)

---

## Quickstart (from README.md)

```bash
source .venv/Scripts/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Notes

- Modular, versioned API structure
- Async support for scalability
- Multi-schema Postgres support (auth, belching, emission)
- Dev scripts for easy setup
- All credentials in scripts are for development only

---

This summary serves as a reference for agentic AI and developers to understand, navigate, and extend the backend system efficiently.
