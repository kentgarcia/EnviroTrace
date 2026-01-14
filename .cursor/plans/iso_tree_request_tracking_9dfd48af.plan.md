---
name: ISO Tree Request Tracking
overview: Overhaul the tree management request system to track detailed phases (Receiving, Inspection, Requirements, Clearance) with ISO compliance, configurable citizen charter timeframes, and a dashboard for monitoring processing delays.
todos:
  - id: backend-models
    content: Create new database models for TreeRequest with all 4 phases and ProcessingStandards
    status: pending
  - id: migration
    content: Create Alembic migration to replace old table structure
    status: pending
    dependencies:
      - backend-models
  - id: backend-schemas
    content: Update Pydantic schemas for all request and phase operations
    status: pending
  - id: backend-crud
    content: Implement CRUD with delay calculation and phase-specific updates
    status: pending
    dependencies:
      - backend-models
      - backend-schemas
  - id: backend-api
    content: Create API endpoints for requests, phases, analytics, and standards
    status: pending
    dependencies:
      - backend-crud
  - id: frontend-api
    content: Update TypeScript interfaces and API client methods
    status: pending
  - id: request-form
    content: Build multi-phase request form with date tracking and requirements checklist
    status: pending
    dependencies:
      - frontend-api
  - id: request-details
    content: Create timeline view with phase progress and delay indicators
    status: pending
    dependencies:
      - frontend-api
  - id: dashboard
    content: Build delay monitoring dashboard with analytics
    status: pending
    dependencies:
      - frontend-api
      - request-details
  - id: standards-config
    content: Create admin interface for configuring processing timeframes
    status: pending
    dependencies:
      - frontend-api
  - id: main-page
    content: Update main requests page with phase filters and delay indicators
    status: pending
    dependencies:
      - request-form
      - request-details
      - dashboard
---

# ISO-Compliant Tree Request Tracking System

## Overview

Complete replacement of the existing tree management request system ([`backend/app/models/urban_greening_models.py`](backend/app/models/urban_greening_models.py)) with a comprehensive 4-phase tracking system that monitors processing times against configurable citizen charter standards.

## Architecture Changes

### Database Layer (Backend)

**1. New Database Models** - [`backend/app/models/urban_greening_models.py`](backend/app/models/urban_greening_models.py)Replace `TreeManagementRequest` model with new structure:

- **TreeRequestProcessingStandards** - Configurable timeframes per phase
- `request_type` (cutting, pruning, ball_out)
- `receiving_standard_days`, `inspection_standard_days`, `requirements_standard_days`, `clearance_standard_days`
- **TreeRequest** (Main table)
- Basic info: `request_number`, `request_type` (cutting/pruning/ball_out), `overall_status`
- Receiving phase fields
- Inspection phase fields  
- Requirements phase with JSON array for checklist items (each with `requirement_name`, `is_checked`, `date_submitted`)
- Clearance phase fields
- Computed fields: `days_in_receiving`, `days_in_inspection`, `days_in_requirements`, `days_in_clearance`, `total_days`, `is_delayed`

**2. Migration Script** - Create Alembic migration

- Drop old `tree_management_requests` table
- Create new tables with all phase-specific columns
- Seed default processing standards

**3. CRUD Operations** - [`backend/app/crud/crud_tree_management.py`](backend/app/crud/crud_tree_management.py)

- Full CRUD for TreeRequest with computed delay calculations
- Methods for updating each phase separately
- Query methods: `get_delayed_requests()`, `get_requests_by_phase()`, `get_average_processing_times()`

**4. Schemas** - [`backend/app/schemas/tree_management_schemas.py`](backend/app/schemas/tree_management_schemas.py)

- `TreeRequestCreate`, `TreeRequestUpdate`, `TreeRequestInDB`
- Phase-specific update schemas: `UpdateReceivingPhase`, `UpdateInspectionPhase`, `UpdateRequirementsPhase`, `UpdateClearancePhase`
- `ProcessingStandardsSchema`

**5. API Endpoints** - [`backend/app/apis/v1/tree_management_router.py`](backend/app/apis/v1/tree_management_router.py)

- CRUD endpoints for tree requests
- Phase update endpoints: `PATCH /requests/{id}/receiving`, `/inspection`, `/requirements`, `/clearance`
- Analytics endpoints: `GET /requests/analytics/delays`, `/analytics/processing-times`
- Standards management: `GET/PUT /processing-standards`

### Frontend Layer (Client)

**1. API Integration** - [`client/src/core/api/tree-management-request-api.ts`](client/src/core/api/tree-management-request-api.ts)

- Update TypeScript interfaces to match new schema
- API methods for phase updates and analytics

**2. Main Request Page** - [`client/src/presentation/roles/urban-greening/pages/tree-requests/TreeRequestsPage.tsx`](client/src/presentation/roles/urban-greening/pages/tree-requests/TreeRequestsPage.tsx)

- Replace with new layout
- Add phase filter (receiving, inspection, requirements, clearance, completed)
- Status badges showing delay indicators
- Stats cards: total requests, by phase, delayed count

**3. Request Form** - [`client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestForm.tsx`](client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestForm.tsx)

- Multi-step form with 4 phase sections
- Date pickers for all date fields
- Dynamic requirements checklist with date tracking
- Month dropdowns where specified

**4. Request Details View** - [`client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestDetails.tsx`](client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestDetails.tsx)

- Timeline view showing all 4 phases with dates
- Visual indicators for delayed phases (red highlights)
- Display days spent in each phase vs. standard
- Quick edit buttons for each phase

**5. Delay Dashboard** - Create `TreeRequestDashboard.tsx`

- Summary cards: total requests, delayed requests, average processing time
- Bar chart: Requests by phase
- Table: Currently delayed requests with days overdue
- Line chart: Processing time trends over months

**6. Processing Standards Config** - Create `ProcessingStandardsSettings.tsx`

- Admin page for configuring timeframes
- Form to set standard days for each phase by request type

## Key Features

### Delay Detection

- Automatic calculation of days in each phase based on date transitions
- Color-coded indicators: Green (on time), Yellow (approaching deadline), Red (delayed)
- Dashboard highlighting bottleneck phases

### Requirements Checklist

Each requirement tracked with:

- Checkbox state
- Date submitted
- Displayed in a grid/table format

### Dropdown Fields

- `received_through`: Dropdown with configurable options + "Other"
- `month`: Standard month picker (Jan-Dec)

### Data Integrity

- Validation: Dates must be sequential (e.g., inspection date after receiving date)
- Auto-fill current date for new entries
- Optional fields allow partial completion

## Implementation Order

1. **Backend foundation**: Models, migration, CRUD operations
2. **Backend API**: Router endpoints with delay calculations
3. **Frontend API**: TypeScript interfaces and API methods
4. **Frontend forms**: Request form with all phase fields
5. **Frontend views**: Details page with timeline
6. **Dashboard**: Analytics and delay monitoring
7. **Settings**: Processing standards configuration

## Files to Create/Modify

### Backend

- Modify: [`backend/app/models/urban_greening_models.py`](backend/app/models/urban_greening_models.py)
- Create: `backend/alembic/versions/xxx_iso_tree_request_tracking.py`
- Modify: [`backend/app/schemas/tree_management_schemas.py`](backend/app/schemas/tree_management_schemas.py)
- Modify: [`backend/app/crud/crud_tree_management.py`](backend/app/crud/crud_tree_management.py)
- Modify: [`backend/app/apis/v1/tree_management_router.py`](backend/app/apis/v1/tree_management_router.py)

### Frontend

- Modify: [`client/src/core/api/tree-management-request-api.ts`](client/src/core/api/tree-management-request-api.ts)
- Modify: [`client/src/presentation/roles/urban-greening/pages/tree-requests/TreeRequestsPage.tsx`](client/src/presentation/roles/urban-greening/pages/tree-requests/TreeRequestsPage.tsx)
- Modify: [`client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestForm.tsx`](client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestForm.tsx)
- Modify: [`client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestDetails.tsx`](client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestDetails.tsx)
- Create: `client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestDashboard.tsx`
- Create: `client/src/presentation/roles/urban-greening/pages/tree-requests/components/ProcessingStandardsSettings.tsx`
- Modify: [`client/src/presentation/roles/urban-greening/pages/tree-requests/logic/useTreeManagementRequests.ts`](client/src/presentation/roles/urban-greening/pages/tree-requests/logic/useTreeManagementRequests.ts)

## Validation & Testing

- Test delay calculation logic with various date scenarios
- Verify requirements checklist date tracking