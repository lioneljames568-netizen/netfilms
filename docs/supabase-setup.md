# Supabase setup

The current account has no Supabase project yet, so migrations are committed but have not been executed.

## Apply schema
1. Create a Supabase project in the organization and region you choose.
2. Wait until the project is healthy.
3. Open the SQL Editor and run migrations in filename order:
   - `0001_catalog_schema.sql`
   - `0002_publication_guardrails.sql`
   - `0003_series_visibility_and_service_grants.sql`
4. Verify tables and policies in the dashboard and run the Supabase security advisors.

## Data API exposure
Supabase's newer projects may not expose newly created public-schema tables to the Data API by default. In the project's Data API settings, explicitly expose the `public` schema (or the intended API schema) before using PostgREST. SQL grants and RLS policies are both required: grants make a table reachable, while RLS limits which rows a role can access.

The migrations include explicit role grants and RLS policies. Keep the `media_assets` table inaccessible to anonymous users; the API should issue short-lived media URLs only after validating the requested published item.

## Credentials
- Frontend: project URL and publishable key only.
- Backend: server-only credentials, stored in the API host's secret manager.
- Never put service-role or secret keys in `NEXT_PUBLIC_*` variables or commit them to Git.

## Admin role
The policies expect a trusted `app_metadata.role = admin` claim. Do not let public signup or user-editable `user_metadata` set this claim. Assign roles only through a trusted administrative process and refresh sessions after role changes.
