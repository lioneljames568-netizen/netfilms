# NetFilms API

FastAPI service for the NetFilms public catalogue.

## Local development (PowerShell)

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

- Health: http://localhost:8000/health
- OpenAPI docs: http://localhost:8000/docs
- Movies: http://localhost:8000/api/v1/movies
- Translators: http://localhost:8000/api/v1/translators
- Series: http://localhost:8000/api/v1/series

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the local environment to enable catalogue reads. Never use a service-role key in the browser. Admin write operations will be added behind server-side authentication and role checks.
