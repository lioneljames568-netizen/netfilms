# NetFilms architecture

## System boundaries

- Next.js app: public discovery, movie pages, player UI and private admin UI.
- FastAPI service: privileged business operations, validation, R2 signed upload workflows.
- Supabase PostgreSQL: normalized catalogue, translator assignments, identities and audit trail.
- Cloudflare R2: media objects; database stores object keys and metadata only.

## Core domain rules

1. A published movie requires at least one translator assignment.
2. An episode requires a series and season relationship and at least one translator before publication.
3. Movie parts are represented independently from seasons and episodes.
4. Public browsing and authorized playback do not require visitor registration.
5. Admin role checks happen server-side. Public registration must never grant admin rights.
6. Only authorized media may be published.

## Build sequence

1. Public visual foundation and navigation.
2. Catalog, details, translators and local watchlist.
3. Player and locally stored playback progress.
4. Supabase schema, RLS policies and public data access.
5. FastAPI auth, admin operations and R2 signed uploads.
6. Admin workflows, tests, deployment and monitoring.

## Storage and video

R2 is object storage; it does not transcode source videos. Add a transcoding/adaptive-streaming service only when source formats and traffic requirements are known. Never expose R2 credentials in browser code.
