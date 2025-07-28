# GitHub Copilot Instructions - Eco Dashboard Navigator

## Project Architecture Overview

This is a **multi-role environmental management system** with cross-platform support. Key architectural principles:

- **Role-based dashboards**: Each user role (`admin`, `air_quality`, `tree_management`, `government_emission`) has dedicated interfaces
- **Multi-schema PostgreSQL**: Database uses schema separation (`auth`, `emission`, `belching`, `urban_greening`) for domain isolation
- **Cross-platform approach**: Web client (React/Vite), Tauri desktop app, React Native mobile app sharing core logic

## Critical Development Patterns

### Role-Based Route Protection

All routes require dual authorization checks:

```typescript
// In route definitions like emission.routes.tsx
beforeLoad: () => {
  requireAuth();
  requireRole(["admin", "government_emission"]);
};
```

### Dashboard Navigation Architecture

- `TopNavBarContainer.tsx` dynamically generates menus based on `dashboardType` prop
- Role mapping lives in `dashboardRoleMap` array - modify this for new roles/dashboards
- Switch dashboard functionality uses auth store roles, not user object roles

### Database Schema Patterns

- **UUID primary keys** with `uuid_generate_v4()` for all entities
- **Foreign keys use schema prefixes**: `"auth.users.id"`, `"emission.vehicles.id"`
- **Soft deletes** via `deleted_at` timestamp (see `auth_models.py`)
- **Schema-specific indexes** for performance: `{"schema": "emission"}`

### Frontend State Management

- **Auth state**: Zustand store (`useAuthStore`) persists roles and tokens
- **API data**: React Query (`@tanstack/react-query`) for server state
- **Navigation**: TanStack Router with programmatic route guards

## Backend Development Workflow

### Model Development

1. Create model in appropriate schema file (`app/models/*_models.py`)
2. Create corresponding CRUD in `app/crud/crud_*.py` extending `CRUDBase`
3. Define Pydantic schemas in `app/schemas/*_schemas.py`
4. Add to `app/db/base_class.py` for Alembic discovery

### FastAPI Service Pattern

```python
# Standard CRUD pattern using async SQLAlchemy
from app.crud.base_crud import CRUDBase
from app.models.emission_models import Vehicle
from app.schemas.emission_schemas import VehicleCreate, VehicleUpdate

vehicle_crud = CRUDBase[Vehicle, VehicleCreate, VehicleUpdate](Vehicle)
```

### Database Migrations

- Use Alembic: `source .venv/Scripts/activate && alembic revision --autogenerate -m "description"`
- Critical: Test schema changes across all domains (auth, emission, belching, urban_greening)

## Frontend Development Workflow

### Role-Based Component Structure

```
client/src/presentation/roles/{role}/
├── pages/
│   └── {page}/
│       ├── components/    # Page-specific UI components
│       └── logic/         # Page-specific hooks and logic
└── {role}.routes.tsx      # Route definitions
```

### Creating New Dashboards

1. Add role to `UserRoleEnum` in backend
2. Create role directory structure in `client/src/presentation/roles/`
3. Update `dashboardRoleMap` in `TopNavBarContainer.tsx`
4. Add route protection in new routes file
5. Update `getMenuItems()` function for navigation

### API Integration Pattern

- Use React Query hooks from `@tanstack/react-query`
- Service functions in `client/src/core/api/` return promises
- Handle both camelCase (frontend) and snake_case (backend) field naming

## Common Gotchas

### Authentication Edge Cases

- Auth store roles may differ from user object roles - always check auth store for route decisions
- Token refresh happens automatically but check for 401s in API calls
- Profile data is separate from user data - fetch via `useMyProfile()`

### Database Relationships

- Use string references for cross-schema ForeignKeys: `ForeignKey("auth.users.id")`
- Relationship back_populates must match exactly between models
- Always include proper indexes for foreign keys and query patterns

### Component Development

- `TopNavBarContainer` - use TopNav for main navigation
- Dashboard components should accept `dashboardType` prop for role-specific behavior
- Shared components live in `client/src/presentation/components/shared/`

### Development Commands

- **Backend**: `cd backend && source .venv/Scripts/activate && uvicorn app.main:app --reload`
- **Frontend**: `cd client && npm run dev`
- **Mobile**: `cd mobile && npm start`

### Key File Locations

- **Route definitions**: `client/src/presentation/routeTree.tsx` (main router setup)
- **Auth logic**: `client/src/core/api/auth.ts` and `client/src/core/hooks/auth/useAuthStore.ts`
- **Database models**: `backend/app/models/` (separated by domain)
- **API endpoints**: `backend/app/apis/v1/` (FastAPI route handlers)

Remember: This system prioritizes **role segregation** and **schema isolation** - always consider the multi-tenant nature when making changes.
