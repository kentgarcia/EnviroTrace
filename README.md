# EnviroTrace

A comprehensive **multi-role environmental management system** designed for environmental monitoring, vehicle emission tracking, air quality management, and urban greening initiatives. The system provides cross-platform access through web, desktop, and mobile applications with role-based dashboards for different user types.

## 🌍 Project Overview

The EnviroTrace System is built around a **role-based architecture** supporting multiple environmental domains:

- **Admin**: System administration and user management
- **Air Quality Monitoring**: Real-time air quality data collection and analysis
- **Tree Management**: Urban forestry and green space management
- **Government Emission**: Vehicle emission testing and compliance tracking

### Key Features

- 🏢 **Multi-schema PostgreSQL database** with domain separation (`auth`, `emission`, `belching`, `urban_greening`)
- 🔐 **Role-based access control** with JWT authentication
- 📱 **Cross-platform support**: Desktop (Tauri), Mobile (React Native)
- 🌐 **RESTful API** built with FastAPI
- 📊 **Real-time dashboards** with dynamic navigation based on user roles
- 💾 **Local-first mobile app** with offline support and background sync

## 🏗️ Architecture

```
eco-dash-navigator/
├── backend/          # FastAPI backend service
├── client/           # React application (with Tauri desktop support)
└── mobile/           # React Native mobile application
```

### Technology Stack

| Component          | Technologies                                            |
| ------------------ | ------------------------------------------------------- |
| **Backend**        | FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT           |
| **Web Client**     | React, TypeScript, Vite, TanStack Router, Tauri         |
| **Mobile**         | React Native, Expo, SQLite, TanStack Query              |
| **Database**       | PostgreSQL with UUID primary keys and schema separation |
| **Authentication** | JWT tokens with role-based authorization                |

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 16+** (for client and mobile)
- **PostgreSQL 13+** (for database)
- **Expo CLI** (for mobile development)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment (Windows)
python -m venv .venv
source .venv/Scripts/activate

# Install dependencies
pip install -r requirements.txt

# Set up database (configure your DATABASE_URL in .env)
alembic upgrade head

# Create admin user
python scripts/create_admin_user.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000` with API documentation at `/api/docs`.

### 2. Web Client Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# For desktop app development
npm run dev:tauri
```

The web application will be available at `http://localhost:5173`.

### 3. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run android  # for Android
npm run ios      # for iOS
```

## 📁 Project Structure

### Backend (`/backend`)

```
backend/
├── app/
│   ├── apis/v1/          # API route handlers
│   ├── core/             # Configuration and security
│   ├── crud/             # Database CRUD operations
│   ├── db/               # Database configuration
│   ├── models/           # SQLAlchemy models (schema-separated)
│   ├── schemas/          # Pydantic schemas
│   └── services/         # Business logic services
├── alembic/              # Database migrations
└── scripts/              # Utility scripts
```

**Key Commands:**

- `source .venv/Scripts/activate` - Activate virtual environment
- `uvicorn app.main:app --reload` - Start development server
- `alembic revision --autogenerate -m "description"` - Create migration
- `alembic upgrade head` - Apply migrations

### Web Client (`/client`)

```
client/
├── src/
│   ├── core/             # API services and utilities
│   ├── presentation/
│   │   ├── components/   # Shared UI components
│   │   └── roles/        # Role-based pages and components
│   │       ├── admin/
│   │       ├── air_quality/
│   │       ├── belching/
│   │       └── tree_management/
│   └── hooks/            # Custom React hooks
└── src-tauri/            # Tauri desktop app configuration
```

**Key Commands:**

- `npm run dev` - Start web development server
- `npm run dev:tauri` - Start desktop app development
- `npm run build` - Build for production
- `npm run build:tauri` - Build desktop app

### Mobile App (`/mobile`)

```
mobile/
├── src/
│   ├── components/       # Shared mobile components
│   ├── core/             # API and utilities
│   ├── hooks/            # Custom hooks
│   ├── navigation/       # React Navigation setup
│   └── screens/          # App screens
└── assets/               # Images and static assets
```

**Key Commands:**

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator

## 🔐 Authentication & Authorization

The system uses **JWT-based authentication** with role-based access control:

### User Roles

- `admin` - Full system access
- `air_quality` - Air quality monitoring features
- `tree_management` - Urban greening and forestry
- `government_emission` - Vehicle emission tracking

### Route Protection

All routes require dual authorization checks:

```typescript
// Example route protection
beforeLoad: () => {
  requireAuth();
  requireRole(["admin", "government_emission"]);
};
```

## 🗄️ Database Schema

The system uses **PostgreSQL with schema separation**:

- `auth` - User authentication and authorization
- `emission` - Vehicle emission and testing data
- `belching` - Smoke belching violations and payments
- `urban_greening` - Tree management and green spaces

### Key Patterns

- **UUID primary keys** with `uuid_generate_v4()`
- **Cross-schema foreign keys**: `ForeignKey("auth.users.id")`
- **Soft deletes** via `deleted_at` timestamp
- **Schema-specific indexes** for performance

## 📱 Mobile App Features

The mobile application provides **local-first architecture** with:

- ✅ **Offline Support** - Full functionality without internet
- 🔄 **Background Sync** - Automatic synchronization when online
- 💾 **Local Database** - SQLite for reliable local storage
- 🔧 **Conflict Resolution** - Smart merging of local and remote changes

## 🛠️ Development Workflow

### Creating New Role-Based Features

1. **Backend**: Add models in appropriate schema (`app/models/*_models.py`)
2. **API**: Create CRUD operations and endpoints
3. **Frontend**: Add role directory in `client/src/presentation/roles/{role}/`
4. **Routes**: Update `dashboardRoleMap` in `TopNavBarContainer.tsx`
5. **Mobile**: Add corresponding screens in mobile app

### Database Changes

1. Create models in appropriate schema file
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review and apply: `alembic upgrade head`
4. Test across all schemas

## 🧪 Testing

### Backend Testing

```bash
cd backend
python -m pytest
```

### Frontend Testing

```bash
cd client
npm test
```

### Mobile Testing

```bash
cd mobile
npm test
```

## 🚢 Deployment

### Backend Deployment

- Configure environment variables for production
- Set up PostgreSQL database
- Deploy using Docker or cloud services
- Run migrations: `alembic upgrade head`

### Web Client Deployment

- Build: `npm run build`
- Deploy static files to CDN or hosting service
- Configure environment variables for API endpoints

### Desktop App Distribution

- Build: `npm run build:tauri`
- Distribute `.msi` (Windows), `.dmg` (macOS), or `.AppImage` (Linux)

### Mobile App Distribution

- Build: `expo build`
- Submit to App Store and Google Play Store

## 📖 API Documentation

- **Development**: `http://localhost:8000/api/docs` (Swagger UI)
- **Alternative**: `http://localhost:8000/api/redoc` (ReDoc)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes following the established patterns
4. Test thoroughly across all platforms
5. Submit a pull request

**Note**: This system prioritizes **role segregation** and **schema isolation** - always consider the multi-tenant nature when making changes.
