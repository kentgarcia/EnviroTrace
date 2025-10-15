source .venv/Scripts/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

---

Render deployment notes:

- Render assigns a dynamic PORT via the $PORT env var. Make sure the server binds to 0.0.0.0 and uses that port.
- Start command example for Render:
  uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
- Health check is available at /api/healthcheck.
- Required env vars: DATABASE_URL, SECRET_KEY (and GOOGLE_API_KEY if using Gemini).
