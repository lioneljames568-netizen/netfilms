# NetFilms data model

This document defines the intended relational shape. It is a design reference, not an applied database migration.

## Catalogue entities

- `movies`: movie records, content type, title, synopsis, year, runtime, quality, publication state and rights metadata.
- `movie_parts`: ordered parts belonging to a movie collection. Part number is never reused as a season or episode number.
- `series`: series-level title and descriptive metadata.
- `seasons`: season number and series foreign key.
- `episodes`: season foreign key, episode number, title, runtime, quality and publication state.
- `translators`: profile, biography and visibility fields.
- `movie_translators`: many-to-many movie/translator assignments.
- `episode_translators`: many-to-many episode/translator assignments.
- `actors`, `movie_actors`: cast directory and movie cast relationships.
- `genres`, `movie_genres`: genre catalogue and movie genre relationships.
- `media_assets`: storage provider, object key or external URL, MIME type, size, checksum and association metadata.
- `comments`: moderated visitor comments, if enabled.
- `admin_users`, `roles`, `permissions`: staff authorization model.
- `audit_logs`: administrative activity trail.
- `site_settings`, `social_links`, `notifications`: configurable platform content.

## Publication invariants

1. A movie may be saved as a draft without a translator, but publishing must fail unless at least one valid translator assignment exists.
2. An episode may be drafted without a translator, but publishing must fail unless at least one valid episode-translator assignment exists.
3. A movie part belongs to its movie collection and has a positive, unique part number within that collection.
4. A season belongs to one series and has a positive, unique season number within that series.
5. An episode belongs to one season and has a positive, unique episode number within that season.
6. Public queries return only published content and public profile fields.
7. Only authorized distribution assets may be attached to a published title.

## Access model

- Enable row-level security on all exposed tables.
- Anonymous visitors may read published catalogue rows and public translator/actor profiles only.
- Visitors do not receive write access to catalogue, media, staff or settings tables.
- Admin mutations must pass server-side role checks and database policies.
- User-editable profile metadata must never grant administrative privileges.

## Media storage

Store large objects in Cloudflare R2. Supabase stores the media record and object key. Browser uploads use short-lived signed URLs issued by the backend. The R2 secret key and Supabase service-role key remain server-side.
