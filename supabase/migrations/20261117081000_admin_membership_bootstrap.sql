-- Allow a signed-in account to read only its own active admin membership.
-- Admins retain the ability to read the full admin roster.
drop policy if exists "admins read admin users" on public.admin_users;
create policy "admins and users read admin membership"
on public.admin_users
for select
to authenticated
using (private.is_admin() or user_id = (select auth.uid()));
