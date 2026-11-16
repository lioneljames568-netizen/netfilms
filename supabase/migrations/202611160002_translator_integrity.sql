grant usage on schema private to anon;
grant execute on function private.is_admin() to anon;

create or replace function private.prevent_last_movie_translator_removal()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.movies m where m.id = old.movie_id and m.status = 'published')
     and not exists (
       select 1 from public.movie_translators mt
       where mt.movie_id = old.movie_id and mt.translator_id <> old.translator_id
     ) then
    raise exception 'A published movie must retain at least one translator';
  end if;
  return old;
end;
$$;

create trigger movie_translators_keep_one
before delete on public.movie_translators
for each row execute function private.prevent_last_movie_translator_removal();

create or replace function private.prevent_last_episode_translator_removal()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.episodes e where e.id = old.episode_id and e.status = 'published')
     and not exists (
       select 1 from public.episode_translators et
       where et.episode_id = old.episode_id and et.translator_id <> old.translator_id
     ) then
    raise exception 'A published episode must retain at least one translator';
  end if;
  return old;
end;
$$;

create trigger episode_translators_keep_one
before delete on public.episode_translators
for each row execute function private.prevent_last_episode_translator_removal();
