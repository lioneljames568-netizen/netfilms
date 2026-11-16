create extension if not exists pgcrypto;

create schema if not exists private;

create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.movie_kind as enum ('standalone', 'part');
create type public.media_kind as enum ('video', 'poster', 'backdrop', 'profile_photo', 'actor_photo', 'episode_thumbnail', 'subtitle');
create type public.admin_role as enum ('owner', 'content_manager', 'editor', 'moderator');

create table public.translators (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  biography text not null default '',
  profile_photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.actors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  biography text not null default '',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.movie_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  total_parts integer check (total_parts is null or total_parts > 0),
  created_at timestamptz not null default now()
);

create table public.movies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  kind public.movie_kind not null default 'standalone',
  release_year integer check (release_year between 1888 and 2200),
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  video_quality text,
  status public.publish_status not null default 'draft',
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  rights_holder text,
  rights_reference text,
  rights_verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_movie_requires_rights check (
    status <> 'published' or (rights_holder is not null and rights_verified_at is not null)
  )
);

create table public.movie_parts (
  movie_id uuid primary key references public.movies(id) on delete cascade,
  collection_id uuid not null references public.movie_collections(id) on delete cascade,
  part_number integer not null check (part_number > 0),
  unique (collection_id, part_number)
);

create table public.movie_translators (
  movie_id uuid not null references public.movies(id) on delete cascade,
  translator_id uuid not null references public.translators(id) on delete restrict,
  credit_order integer not null default 1 check (credit_order > 0),
  primary key (movie_id, translator_id)
);

create table public.movie_actors (
  movie_id uuid not null references public.movies(id) on delete cascade,
  actor_id uuid not null references public.actors(id) on delete restrict,
  character_name text,
  credit_order integer not null default 1 check (credit_order > 0),
  primary key (movie_id, actor_id)
);

create table public.movie_genres (
  movie_id uuid not null references public.movies(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete restrict,
  primary key (movie_id, genre_id)
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  release_year integer check (release_year between 1888 and 2200),
  status public.publish_status not null default 'draft',
  rights_holder text,
  rights_reference text,
  rights_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_series_requires_rights check (
    status <> 'published' or (rights_holder is not null and rights_verified_at is not null)
  )
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  season_number integer not null check (season_number > 0),
  title text,
  status public.publish_status not null default 'draft',
  unique (series_id, season_number)
);

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  title text not null,
  description text not null default '',
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  video_quality text,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, episode_number)
);

create table public.episode_translators (
  episode_id uuid not null references public.episodes(id) on delete cascade,
  translator_id uuid not null references public.translators(id) on delete restrict,
  credit_order integer not null default 1 check (credit_order > 0),
  primary key (episode_id, translator_id)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  kind public.media_kind not null,
  external_url text,
  r2_object_key text,
  content_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  width integer,
  height integer,
  duration_seconds integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint media_asset_has_one_source check (
    (external_url is not null and r2_object_key is null)
    or (external_url is null and r2_object_key is not null)
  )
);

create table public.movie_media (
  movie_id uuid not null references public.movies(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  kind public.media_kind not null,
  primary key (movie_id, kind, media_asset_id)
);

create table public.episode_media (
  episode_id uuid not null references public.episodes(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  kind public.media_kind not null,
  primary key (episode_id, kind, media_asset_id)
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid references public.movies(id) on delete cascade,
  episode_id uuid references public.episodes(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 3000),
  status text not null default 'pending' check (status in ('pending', 'visible', 'hidden', 'reported')),
  created_at timestamptz not null default now(),
  constraint comment_has_one_target check (
    (movie_id is not null and episode_id is null)
    or (movie_id is null and episode_id is not null)
  )
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index movies_publication_idx on public.movies (status, published_at desc);
create index movies_year_idx on public.movies (release_year desc);
create index episodes_publication_idx on public.episodes (status, published_at desc);
create index comments_moderation_idx on public.comments (status, created_at desc);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = (select auth.uid()) and au.is_active = true
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.require_movie_translator()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'
     and not exists (select 1 from public.movie_translators mt where mt.movie_id = new.id) then
    raise exception 'A published movie must have at least one translator';
  end if;
  return new;
end;
$$;

create trigger movies_require_translator
before insert or update of status on public.movies
for each row execute function private.require_movie_translator();

create or replace function private.require_episode_translator()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'
     and not exists (select 1 from public.episode_translators et where et.episode_id = new.id) then
    raise exception 'A published episode must have at least one translator';
  end if;
  return new;
end;
$$;

create trigger episodes_require_translator
before insert or update of status on public.episodes
for each row execute function private.require_episode_translator();

alter table public.translators enable row level security;
alter table public.actors enable row level security;
alter table public.genres enable row level security;
alter table public.movie_collections enable row level security;
alter table public.movies enable row level security;
alter table public.movie_parts enable row level security;
alter table public.movie_translators enable row level security;
alter table public.movie_actors enable row level security;
alter table public.movie_genres enable row level security;
alter table public.series enable row level security;
alter table public.seasons enable row level security;
alter table public.episodes enable row level security;
alter table public.episode_translators enable row level security;
alter table public.media_assets enable row level security;
alter table public.movie_media enable row level security;
alter table public.episode_media enable row level security;
alter table public.admin_users enable row level security;
alter table public.comments enable row level security;
alter table public.site_settings enable row level security;
alter table public.social_links enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "public reads active translators" on public.translators for select to anon, authenticated using (is_active or private.is_admin());
create policy "public reads actors" on public.actors for select to anon, authenticated using (true);
create policy "public reads genres" on public.genres for select to anon, authenticated using (true);
create policy "public reads published collections" on public.movie_collections for select to anon, authenticated using (
  exists (select 1 from public.movie_parts mp join public.movies m on m.id = mp.movie_id where mp.collection_id = id and m.status = 'published')
  or private.is_admin()
);
create policy "public reads published movies" on public.movies for select to anon, authenticated using (status = 'published' or private.is_admin());
create policy "public reads published movie parts" on public.movie_parts for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published') or private.is_admin()
);
create policy "public reads published movie translators" on public.movie_translators for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published') or private.is_admin()
);
create policy "public reads movie cast" on public.movie_actors for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published') or private.is_admin()
);
create policy "public reads movie genres" on public.movie_genres for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published') or private.is_admin()
);
create policy "public reads published series" on public.series for select to anon, authenticated using (status = 'published' or private.is_admin());
create policy "public reads published seasons" on public.seasons for select to anon, authenticated using (
  status = 'published' and exists (select 1 from public.series s where s.id = series_id and s.status = 'published') or private.is_admin()
);
create policy "public reads published episodes" on public.episodes for select to anon, authenticated using (
  status = 'published' and exists (select 1 from public.seasons se join public.series s on s.id = se.series_id where se.id = season_id and se.status = 'published' and s.status = 'published')
  or private.is_admin()
);
create policy "public reads episode translators" on public.episode_translators for select to anon, authenticated using (
  exists (select 1 from public.episodes e where e.id = episode_id and e.status = 'published') or private.is_admin()
);
create policy "public reads published media references" on public.media_assets for select to anon, authenticated using (
  private.is_admin()
  or exists (select 1 from public.movie_media mm join public.movies m on m.id = mm.movie_id where mm.media_asset_id = id and m.status = 'published')
  or exists (select 1 from public.episode_media em join public.episodes e on e.id = em.episode_id where em.media_asset_id = id and e.status = 'published')
);
create policy "public reads movie media links" on public.movie_media for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published') or private.is_admin()
);
create policy "public reads episode media links" on public.episode_media for select to anon, authenticated using (
  exists (select 1 from public.episodes e where e.id = episode_id and e.status = 'published') or private.is_admin()
);
create policy "admins read admin users" on public.admin_users for select to authenticated using (private.is_admin());
create policy "public creates pending comments" on public.comments for insert to anon, authenticated with check (status = 'pending');
create policy "public reads visible comments" on public.comments for select to anon, authenticated using (status = 'visible' or private.is_admin());
create policy "public reads active social links" on public.social_links for select to anon, authenticated using (is_active or private.is_admin());
create policy "public reads published notifications" on public.notifications for select to anon, authenticated using (status = 'published' or private.is_admin());
create policy "public reads site settings" on public.site_settings for select to anon, authenticated using (key in ('site_name', 'contact_whatsapp', 'social_links') or private.is_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'translators','actors','genres','movie_collections','movies','movie_parts',
    'movie_translators','movie_actors','movie_genres','series','seasons','episodes',
    'episode_translators','media_assets','movie_media','episode_media','admin_users',
    'comments','site_settings','social_links','notifications','audit_logs'
  ] loop
    execute format('create policy "admins manage %I" on public.%I for all to authenticated using (private.is_admin()) with check (private.is_admin())', table_name, table_name);
  end loop;
end $$;

grant select on public.translators, public.actors, public.genres, public.movie_collections,
  public.movies, public.movie_parts, public.movie_translators, public.movie_actors,
  public.movie_genres, public.series, public.seasons, public.episodes,
  public.episode_translators, public.media_assets, public.movie_media, public.episode_media,
  public.comments, public.site_settings, public.social_links, public.notifications to anon, authenticated;
grant insert on public.comments to anon, authenticated;
grant all on public.translators, public.actors, public.genres, public.movie_collections,
  public.movies, public.movie_parts, public.movie_translators, public.movie_actors,
  public.movie_genres, public.series, public.seasons, public.episodes,
  public.episode_translators, public.media_assets, public.movie_media, public.episode_media,
  public.admin_users, public.comments, public.site_settings, public.social_links,
  public.notifications, public.audit_logs to authenticated;
