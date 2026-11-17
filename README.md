# NetFilms — Movies in Kinyarwanda

A responsive discovery and streaming platform for authorized Kinyarwanda-translated movies.

## Monorepo

- `apps/web` — Next.js 15, TypeScript and Tailwind public website
- `apps/api` — FastAPI public catalogue API
- `supabase/migrations` — PostgreSQL schema, relationships and row-level security
- `docs` — architecture and implementation notes

## Development status

The public frontend currently has a responsive homepage, movie directory, movie detail pages, series directory, translator directory and device-local watchlist. Catalogue entries and artwork are illustrative placeholders until the authorized NetFilms catalogue is connected.

The backend foundation now exposes health, published movie, translator and series endpoints. The Supabase schema has been committed but must still be applied to a provisioned project.

## Run the frontend

```powershell
cd apps/web
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Run the backend

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for the API reference.

Configure the backend's `SUPABASE_URL` and `SUPABASE_ANON_KEY` using the public/publishable key from your Supabase project. Never use a service-role key in the browser.

## Database

Apply migrations in `supabase/migrations` to a new Supabase project after reviewing them. The schema enforces translator assignments for published movies and episodes and keeps draft content private from public catalogue queries.

## Product rules

- Only authorized Kinyarwanda-translated content may be published.
- Every published movie and episode must have at least one assigned translator.
- Movie parts are not seasons or episodes.
- Public viewing must not require registration.
- Admin access must be authenticated and authorized server-side.
- Secrets, service-role keys and R2 credentials must never be committed.
