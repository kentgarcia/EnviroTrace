source .venv/Scripts/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

---

Render deployment notes:

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
