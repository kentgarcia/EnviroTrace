# Urban Greening Projects - Backend Setup Complete

## Overview
Urban Greening Projects backend integration is now complete with full CRUD operations, auto-generated project codes, and support for complex nested plant data.

## Components Created

### 1. Database Schema (Supabase Migration)
**Migration**: `add_urban_greening_projects_fields`
- Added `project_code` (auto-generated as UGP+YYYY+####)
- Renamed `type` → `project_type`
- Renamed `responsible_person` → `project_lead`
- Added `barangay`, `area_sqm`, date fields (planned/actual start/end)
- Added `plants` TEXT field for JSON array of plant objects
- Added `total_plants`, `surviving_plants`, `survival_rate` for tracking
- Added `contact_number`, `organization`, `funding_source`, `budget`
- Added `description`, `photos`, `linked_cut_tree_ids`
- Created trigger function `generate_project_code()` for auto-code generation

**Migration**: `make_planting_date_nullable`
- Made `planting_date` nullable (legacy field, using planned/actual dates instead)

### 2. Backend Files Created/Modified

#### Schemas: `app/schemas/urban_greening_project_schemas.py`
```python
- ProjectPlant: Nested model for plants array
- UrbanGreeningProjectBase: Base schema with all fields
- UrbanGreeningProjectCreate: For POST requests
- UrbanGreeningProjectUpdate: For PATCH requests
- UrbanGreeningProjectInDB: Database representation
- ProjectStats: Statistics aggregation
```

**Key Features:**
- Field validators for JSON parsing (plants, linked_cut_tree_ids, photos)
- Proper handling of nested ProjectPlant objects
- Pydantic v2 validators with mode="before"

#### CRUD: `app/crud/crud_urban_greening_project.py`
```python
- get(): Get single project by ID
- get_multi(): List with filters (status, project_type, search)
- create(): Create with auto-calculation of total_plants
- update(): Update with recalculation of total_plants
- remove(): Delete project
- get_stats(): Aggregate statistics (totals, by type, by status)
```

**Key Features:**
- JSON serialization/deserialization for complex fields
- Auto-calculation of `total_plants` from plants array
- Search by project_name, project_code, or location
- Stats with survival rates and recent plantings (last 30 days)

#### API Router: `app/apis/v1/urban_greening_projects.py`
```python
GET    /urban-greening-projects?status=X&project_type=Y&search=Z
GET    /urban-greening-projects/stats
GET    /urban-greening-projects/{id}
POST   /urban-greening-projects
PATCH  /urban-greening-projects/{id}
DELETE /urban-greening-projects/{id}
```

**Key Features:**
- Custom serialization function `_serialize_project()` for JSON parsing
- Query parameter filtering (status, project_type, search)
- Proper error handling with 404 responses
- Date/numeric type conversions for frontend compatibility

#### Model: `app/models/urban_greening_models.py`
Updated `UrbanGreeningProject` model to match new schema:
- Removed old fields (quantity, species)
- Added all new fields matching migration
- Updated indexes for project_code, project_type

#### Router Registration: `app/apis/v1/api.py`
```python
from .urban_greening_projects import router as urban_greening_projects_router
api_v1_router.include_router(
    urban_greening_projects_router, 
    prefix="/urban-greening-projects", 
    tags=["Urban Greening Projects"]
)
```

### 3. Frontend Updates

#### API Client: `client/src/core/api/urban-greening-project-api.ts`
- Fixed query parameter from `type` to `project_type`
- All CRUD functions ready to use
- Proper TypeScript types matching backend

## API Endpoints

### List Projects
```http
GET /api/v1/urban-greening-projects
Query Params: ?status=planning&project_type=tree_planting&search=barangay
```

### Get Stats
```http
GET /api/v1/urban-greening-projects/stats
Returns: {
  total_projects, active_projects, completed_projects,
  total_plants_planned, total_plants_planted, survival_rate,
  by_type: [{type, count, plants}],
  by_status: [{status, count}],
  recent_plantings
}
```

### Get Single Project
```http
GET /api/v1/urban-greening-projects/{id}
```

### Create Project
```http
POST /api/v1/urban-greening-projects
Body: {
  project_name: string,
  project_type: string,
  location: string,
  plants: [{
    plant_type: string,
    common_name: string,
    quantity: number,
    species?: string,
    unit_cost?: number,
    source?: string
  }],
  ...other fields
}

Response: Project with auto-generated project_code
```

### Update Project
```http
PATCH /api/v1/urban-greening-projects/{id}
Body: Partial project fields
```

### Delete Project
```http
DELETE /api/v1/urban-greening-projects/{id}
```

## Data Flow

### Creating a Project
1. Frontend sends POST with project data including plants array
2. Backend CRUD serializes plants to JSON string
3. Backend calculates `total_plants` from plants array sum
4. Database trigger generates `project_code` (UGP+YYYY+####)
5. Record saved with all fields
6. Backend CRUD retrieves record
7. Backend router deserializes JSON fields and returns to frontend

### Project Code Generation
- Format: `UGP{YEAR}{SEQUENCE}`
- Example: `UGP20250001`, `UGP20250002`
- Auto-increments per year (resets to 0001 each January 1)
- Uses `planting_date` if set, otherwise `CURRENT_DATE`

## Plants Array Structure

Each project has a `plants` field containing JSON array:
```json
[
  {
    "plant_type": "tree",
    "species": "Narra (Pterocarpus indicus)",
    "common_name": "Narra",
    "quantity": 100,
    "unit_cost": 150.00,
    "source": "nursery"
  },
  {
    "plant_type": "ornamental",
    "common_name": "Bougainvillea",
    "quantity": 50,
    "unit_cost": 80.00,
    "source": "purchase"
  }
]
```

## Testing

### Verify Backend Running
```bash
cd backend
uvicorn app.main:app --reload
```

### Test Imports
```bash
cd backend
python -c "from app.schemas.urban_greening_project_schemas import UrbanGreeningProjectCreate; from app.crud.crud_urban_greening_project import urban_greening_project_crud; from app.apis.v1.urban_greening_projects import router; print('All imports successful!')"
```

### Check Database
```sql
-- Verify schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'urban_greening' 
AND table_name = 'urban_greening_projects'
ORDER BY ordinal_position;

-- Check trigger
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generate_project_code';

-- Count records
SELECT COUNT(*) FROM urban_greening.urban_greening_projects;
```

## Security Warnings

From `mcp_supabase_get_advisors`:
- ⚠️ Function `generate_project_code` has mutable search_path
- [Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- Fix: Add `SECURITY DEFINER SET search_path = urban_greening, pg_temp`

## Next Steps

1. ✅ Backend CRUD operations complete
2. ✅ API endpoints registered
3. ✅ Frontend API client updated
4. ⏳ Connect frontend UI components to API
5. ⏳ Implement project form with plants array management
6. ⏳ Add validation for project types and statuses
7. ⏳ Implement stats dashboard
8. ⏳ Fix security advisories (search_path in triggers)

## Frontend Integration Example

```typescript
import {
  fetchUrbanGreeningProjects,
  createUrbanGreeningProject,
  UrbanGreeningProjectCreate
} from '@/core/api/urban-greening-project-api';

// List projects
const projects = await fetchUrbanGreeningProjects({
  status: 'planning',
  project_type: 'tree_planting'
});

// Create project
const newProject: UrbanGreeningProjectCreate = {
  project_name: "Barangay Reforestation",
  project_type: "reforestation",
  location: "Barangay San Roque",
  barangay: "San Roque",
  plants: [
    {
      plant_type: "tree",
      common_name: "Narra",
      species: "Pterocarpus indicus",
      quantity: 100,
      unit_cost: 150
    }
  ],
  project_lead: "Juan Dela Cruz",
  budget: 15000
};

const created = await createUrbanGreeningProject(newProject);
console.log("Project Code:", created.project_code); // UGP20250001
```

## Status: ✅ Ready for Frontend Integration
