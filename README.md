# NetFilms — Movies in Kinyarwanda

A streaming discovery platform for authorized Kinyarwanda-translated movies.

## Monorepo layout

- `apps/web` — Next.js public website and admin interface
- `apps/api` — FastAPI backend (added in the backend foundation phase)
- `supabase/` — database migrations and local Supabase configuration
- `docs/` — architecture and implementation notes

## Current status

Phase 1 foundation: public website shell and responsive design system.

The movie catalogue currently uses clearly marked demonstration data. No movie streams or distribution rights are implied.

## Frontend development

```bash
cd apps/web
npm install
npm run dev
```

## Required environment variables

See `apps/web/.env.example`. Never commit secrets, service-role keys, or R2 credentials.

## Product rules

- Only authorized Kinyarwanda-translated content may be published.
- Every published movie and episode must have at least one assigned translator.
- Movie parts are not seasons or episodes.
- Public viewing must not require registration.
- Admin access must be authenticated and authorized server-side.
