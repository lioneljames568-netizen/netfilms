-- NetFilms publication guardrails and actor credits.
-- These objects are intentionally kept in the public schema and protected by RLS.

alter table public.movie_actors enable row level security;

create policy "public read actor credits for published movies" on public.movie_actors
for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published')
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "admins manage movie actor credits" on public.movie_actors
for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on public.movie_actors to anon, authenticated;
grant all on public.movie_actors to authenticated;

-- Prevent publishing a movie until at least one translator credit exists.
create or replace function public.enforce_movie_translator_before_publish()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'
     and not exists (
       select 1 from public.movie_translators mt where mt.movie_id = new.id
     ) then
    raise exception 'A movie needs at least one translator before it can be published'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger movies_require_translator_to_publish
before insert or update of status on public.movies
for each row execute function public.enforce_movie_translator_before_publish();

-- Prevent publishing an episode until at least one translator credit exists.
create or replace function public.enforce_episode_translator_before_publish()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'
     and not exists (
       select 1 from public.episode_translators et where et.episode_id = new.id
     ) then
    raise exception 'An episode needs at least one translator before it can be published'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger episodes_require_translator_to_publish
before insert or update of status on public.episodes
for each row execute function public.enforce_episode_translator_before_publish();

-- Restrict direct execution of trigger functions to the database owner.
revoke all on function public.enforce_movie_translator_before_publish() from public, anon, authenticated;
revoke all on function public.enforce_episode_translator_before_publish() from public, anon, authenticated;
