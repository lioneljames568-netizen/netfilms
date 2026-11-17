# NetFilms administrator setup

The admin area is private. It does not offer public registration, and a Supabase Auth user is not an administrator until a matching active row exists in `public.admin_users`.

## 1. Create the owner account

1. Open the NetFilms Supabase project.
2. Go to **Authentication → Users**.
3. Invite your owner email address, or create the account using the secure invitation flow.
4. Confirm the account has been created.

## 2. Assign the first owner role

In **SQL Editor**, run the following after replacing the email and display name with the actual owner details:

```sql
insert into public.admin_users (user_id, display_name, role, is_active)
select id, 'NetFilms Owner', 'owner', true
from auth.users
where lower(email) = lower('YOUR_OWNER_EMAIL')
on conflict (user_id) do update
set display_name = excluded.display_name,
    role = 'owner',
    is_active = true;
```

Confirm exactly one row was affected. Do not add a service-role key to the frontend or commit any secret key to GitHub.

## 3. Assign a content manager

After the owner account can sign in, invite the content manager through Supabase Authentication, then have the owner add their user ID in the same way:

```sql
insert into public.admin_users (user_id, display_name, role, is_active)
select id, 'Content Manager', 'content_manager', true
from auth.users
where lower(email) = lower('CONTENT_MANAGER_EMAIL')
on conflict (user_id) do update
set display_name = excluded.display_name,
    role = 'content_manager',
    is_active = true;
```

## 4. Configure the frontend

Set these variables in `apps/web/.env.local` for local development and in the frontend hosting environment for production:

- `NEXT_PUBLIC_SUPABASE_URL` = the NetFilms project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the project's publishable key (or legacy anon key)

These are public client credentials and rely on Row Level Security. Never use a `service_role` key or secret API key in a `NEXT_PUBLIC_*` variable.

## 5. Sign in

Open `/admin` and sign in using the invited Auth account. The dashboard verifies the account's active `admin_users` row before showing content tools.

The current admin phase supports translator creation and movie draft creation with a mandatory translator assignment. Publishing remains intentionally disabled until the rights-verification and secure media-upload workflow is complete.
