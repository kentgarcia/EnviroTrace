# EnviroTrace Backend

FastAPI-based backend for EnviroTrace environmental management system.

## Quick Start with Supabase

### Prerequisites
- Python 3.8+
- A Supabase project
- Supabase database password

### Setup (Automated)

**Windows:**
```bash
cd backend
scripts\setup_supabase.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x scripts/setup_supabase.sh
./scripts/setup_supabase.sh
```

### Setup (Manual)

1. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup database:**
   ```bash
   python scripts/setup_supabase_schemas.py
   alembic upgrade head
   ```

4. **Start server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Access Points
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc

## Database Migration

### Migrating from Local to Supabase

See [SUPABASE_MIGRATION_GUIDE.md](./SUPABASE_MIGRATION_GUIDE.md) for detailed instructions.

Quick steps:
1. Update `.env` with Supabase credentials
2. Run `python scripts/setup_supabase_schemas.py`
3. Run `alembic upgrade head`
4. Create admin user

### Testing Connection

```bash
python scripts/test_supabase_connection.py
```

---

## Legacy Deployment Notes

### Render deployment notes:

- Render assigns a dynamic PORT via the $PORT env var. Make sure the server binds to 0.0.0.0 and uses that port.
- Start command example for Render:
  uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
- Health check is available at /api/healthcheck.
- Required env vars: DATABASE_URL, SECRET_KEY (and GOOGLE_API_KEY if using Gemini).

Migrations:

- Auto on Render: The render.yaml runs `alembic upgrade head` after each deploy (postDeployCommand). Ensure `DATABASE_URL` is set in the service environment to the INTERNAL Render Postgres URL with the async driver for the app, e.g.
  - App runtime: `DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DBNAME`
  - Alembic uses a sync URL internally (it auto-converts to remove `+asyncpg`).
- Manual on Render: You can also trigger a manual deploy to re-run the migration or SSH into a shell and run `alembic upgrade head` from the `backend` directory if needed.
- Local against Render DB: To migrate locally to the Render database, export env vars and run:
  1. `export DATABASE_URL="postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DBNAME"`
  2. `export ALEMBIC_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"` # optional; env.py already converts
  3. `cd backend && alembic upgrade head`


Test Account Summary:
----------------------------------------------------------------------
Email: admin@envirotrace.com
Password: Test123!
Roles: admin
Super Admin: True

Email: airquality@envirotrace.com
Password: Test123!
Roles: air_quality
Super Admin: False

Email: treemanagement@envirotrace.com
Password: Test123!
Roles: tree_management
Super Admin: False

Email: emission@envirotrace.com
Password: Test123!
Roles: government_emission
Super Admin: False

Email: multirole@envirotrace.com
Password: Test123!
Roles: air_quality, tree_management
Super Admin: False