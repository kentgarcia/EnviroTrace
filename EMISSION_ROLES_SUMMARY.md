# Emission Roles Summary

This document provides a comprehensive overview of the emission-related roles, permissions, and functionality in the Eco-Dashboard Navigator system.

## Table of Contents

1. [Role Definitions](#role-definitions)
2. [Authentication & Authorization](#authentication--authorization)
3. [Role-based Features](#role-based-features)
4. [Database Schema](#database-schema)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [API Endpoints](#api-endpoints)
8. [Navigation & Routes](#navigation--routes)

---

## Role Definitions

### User Role Enumeration

The system defines the following user roles in `backend/app/models/auth_models.py`:

```python
class UserRoleEnum(str, enum.Enum):
    admin = "admin"
    air_quality = "air_quality"
    tree_management = "tree_management"
    government_emission = "government_emission"
```

### Government Emission Role

- **Role Name**: `government_emission`
- **Purpose**: Manage and monitor government vehicle emissions and compliance
- **Access Level**: Specialized role for emission data management

---

## Authentication & Authorization

### Route Protection

All emission-related routes require:

1. **Authentication**: User must be signed in
2. **Role Authorization**: User must have either `admin` or `government_emission` role

```typescript
// From emission.routes.tsx
const createGovEmissionRoute = (path: string, component: RouteComponent) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      requireAuth();
      requireRole(["admin", "government_emission"]);
    },
    component,
  });
};
```

### Dashboard Access Control

Users with `government_emission` role can access the Government Emission dashboard:

```typescript
// From DashboardSelection.tsx
{
  hasRole("government_emission") && (
    <DashboardCard
      title="Government Emission"
      description="Analyze emission data from government facilities and public transportation"
      icon="/images/bg_govemissions.jpg"
      onClick={() => handleDashboardSelect("government-emission")}
      className="border-ems-gray-200 hover:border-ems-gray-400"
    />
  );
}
```

---

## Role-based Features

### Core Functionalities

#### 1. Dashboard Overview (`/government-emission/overview`)

- **Real-time emission statistics and analytics**
- **Interactive chatbot assistant** for data queries
- **Key metrics display**:
  - Total vehicles tracked
  - Compliance rates
  - Test completion status
  - Office-wise performance
- **Visual analytics**:
  - Pie charts for compliance distribution
  - Bar charts for performance trends
  - Time-series data visualization

#### 2. Vehicle Management (`/government-emission/vehicles`)

- **CRUD operations** for vehicle records
- **Vehicle information tracking**:
  - Plate number
  - Driver details (name, contact)
  - Office assignment
  - Vehicle specifications (type, engine, wheels)
- **Test status tracking**:
  - Passed/Failed/Untested status
  - Historical test records
- **Advanced features**:
  - Search and filtering capabilities
  - Bulk operations
  - CSV export functionality
  - Pagination for large datasets

#### 3. Quarterly Testing Management (`/government-emission/quarterly-testing`)

- **Test scheduling and management**
- **Test result recording**:
  - Vehicle selection
  - Test date and parameters
  - Pass/fail results
  - Technician information
- **Quarterly compliance tracking**
- **Export capabilities** for compliance reports

#### 4. Office Management (`/government-emission/offices`)

- **Government office registration and management**
- **Office compliance monitoring**:
  - Vehicle count per office
  - Compliance rates
  - Performance analytics
- **Multi-tab interface**:
  - Overview dashboard
  - Office management
  - Analytics
  - Reports generation

### Data Management Capabilities

#### Vehicle Data Model

```typescript
interface Vehicle {
  id: string;
  plate_number: string;
  driver_name: string;
  contact_number?: string;
  vehicle_type: string;
  engine_type: string;
  wheels: number;
  office_id: string;
  office_name: string;
  created_at: string;
  updated_at: string;
}
```

#### Emission Test Model

```typescript
interface EmissionTest {
  id: string;
  vehicle_id: string;
  test_date: string;
  quarter: number;
  year: number;
  result: boolean | null; // true=passed, false=failed, null=not tested
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

---

## Database Schema

### User Role Management

```sql
-- User table in auth schema
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255) NOT NULL,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles mapping
CREATE TABLE auth.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_enum_auth NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);
```

### Emission-Related Tables

- **Vehicles**: Store government vehicle information
- **Emission Tests**: Record test results and compliance data
- **Offices**: Government office registry
- **Driver History**: Track driver changes and vehicle assignments

---

## Frontend Implementation

### Component Architecture

```
presentation/roles/emission/
├── pages/
│   ├── Overview.tsx          # Dashboard with analytics
│   ├── Vehicles.tsx          # Vehicle management
│   ├── QuarterlyTesting.tsx  # Test scheduling/results
│   └── Offices.tsx           # Office management
├── components/
│   ├── vehicles/             # Vehicle-specific components
│   ├── quarterly/            # Testing components
│   ├── offices/              # Office components
│   └── overview/             # Dashboard components
└── emission.routes.tsx       # Route definitions
```

### Key Features Implementation

#### Advanced Search & Filtering

- **Multi-criteria search**: plate number, driver name, office
- **Status filtering**: passed, failed, untested
- **Office-based filtering**
- **Engine type filtering**
- **Real-time search with debouncing**

#### Data Export

- **CSV export** for vehicle records
- **Compliance reports** generation
- **Test results export**

#### Interactive UI Elements

- **Modal dialogs** for CRUD operations
- **Confirmation dialogs** for destructive actions
- **Loading states** and error handling
- **Pagination** for large datasets
- **Responsive design** for mobile/desktop

---

## Backend Implementation

### Service Layer Architecture

```
backend/app/
├── models/
│   ├── auth_models.py        # User and role models
│   ├── emission_models.py    # Emission-specific models
│   └── belching_models.py    # Related models
├── crud/
│   ├── crud_user.py          # User operations
│   ├── crud_emission.py      # Emission CRUD
│   └── base_crud.py          # Base CRUD operations
├── services/
│   ├── auth_service.py       # Authentication logic
│   ├── emission_service.py   # Business logic
│   └── user_service.py       # User management
└── apis/v1/                  # API endpoints
```

### Permission Validation

```python
# Example role validation decorator
def require_emission_role(func):
    def wrapper(current_user: User):
        if not has_role(current_user, ["admin", "government_emission"]):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return func(current_user)
    return wrapper
```

---

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user info

### Vehicle Management

- `GET /api/vehicles` - List vehicles with filtering
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle
- `GET /api/vehicles/{id}` - Get vehicle details

### Emission Testing

- `GET /api/emission-tests` - List test results
- `POST /api/emission-tests` - Record new test
- `PUT /api/emission-tests/{id}` - Update test result
- `DELETE /api/emission-tests/{id}` - Delete test record

### Office Management

- `GET /api/offices` - List government offices
- `POST /api/offices` - Register new office
- `PUT /api/offices/{id}` - Update office info
- `GET /api/offices/{id}/compliance` - Get compliance stats

### Dashboard Analytics

- `GET /api/dashboard/stats` - Get summary statistics
- `GET /api/dashboard/compliance` - Get compliance data
- `GET /api/dashboard/trends` - Get trend analysis

---

## Navigation & Routes

### Route Structure

```
/government-emission/
├── /overview              # Dashboard homepage
├── /vehicles              # Vehicle management
├── /quarterly-testing     # Test scheduling/results
├── /offices              # Office management
├── /reports              # Compliance reports
└── /settings             # Role settings
```

### Navigation Menu

The system provides role-based navigation with the following menu items:

- **Dashboard**: Overview and analytics
- **Vehicles**: Fleet management
- **Quarterly Testing**: Compliance testing
- **Offices**: Government office registry
- **Settings**: Role-specific configurations

### Dashboard Switching

Users with multiple roles can switch between dashboards:

```typescript
const dashboardRoleMap = [
  {
    role: "government_emission",
    label: "Government Emission",
    path: "/government-emission/overview",
  },
  // ... other roles
];
```

---

## Security Considerations

### Role-based Access Control (RBAC)

1. **Route-level protection**: All emission routes require proper authorization
2. **Component-level security**: UI elements conditionally rendered based on roles
3. **API-level validation**: Backend validates user roles for all endpoints

### Data Protection

1. **User data isolation**: Users can only access data within their scope
2. **Audit trails**: All actions are logged for compliance
3. **Secure authentication**: JWT-based authentication with role claims

---

## Integration Points

### Inter-module Communication

- **Shared authentication**: Common auth system across all modules
- **Shared UI components**: Reusable components from shared library
- **Common data models**: Standardized data structures

### External Integrations

- **Export capabilities**: CSV, PDF report generation
- **API compatibility**: RESTful APIs for third-party integrations
- **Database synchronization**: Multi-schema PostgreSQL setup

---

## Development Notes

### Key Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- **Authentication**: JWT with role-based claims
- **State Management**: React Query, Zustand

### Code Organization

- **Modular architecture**: Role-based module separation
- **Component reusability**: Shared UI component library
- **Type safety**: Full TypeScript implementation
- **API consistency**: RESTful design patterns

---

_This document serves as a comprehensive reference for developers and AI agents working with the emission role system in the Eco-Dashboard Navigator project._
