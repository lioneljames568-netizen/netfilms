# NetFilms API

FastAPI service foundation. Install dependencies with `pip install -r requirements.txt`, then run `uvicorn app.main:app --reload` from this directory.

Health check: `GET /api/v1/health`.

Database access, authentication, R2 signing and admin endpoints will be added after the Supabase project and storage account are provisioned. Never expose privileged credentials to the frontend.
