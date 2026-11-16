-- NetFilms initial catalogue schema.
-- Run against a NEW Supabase project. All exposed tables use RLS.
create extension if not exists pgcrypto;

create table if not exists public.translators (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  bio text,
  avatar_object_key text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  synopsis text,
  release_year integer check (release_year between 1888 and 2200),
  maturity_rating text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  poster_object_key text,
  backdrop_object_key text,
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Parts belong to a movie; they are deliberately not seasons or episodes.
create table if not exists public.movie_parts (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  part_number integer not null check (part_number > 0),
  title text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  media_asset_id uuid,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (movie_id, part_number)
);

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  synopsis text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  poster_object_key text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  season_number integer not null check (season_number > 0),
  title text,
  unique (series_id, season_number)
);

create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  title text not null,
  synopsis text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  media_asset_id uuid,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (season_id, episode_number)
);

create table if not exists public.movie_translators (
  movie_id uuid not null references public.movies(id) on delete cascade,
  translator_id uuid not null references public.translators(id) on delete restrict,
  credit_role text not null default 'translator',
  primary key (movie_id, translator_id)
);

create table if not exists public.episode_translators (
  episode_id uuid not null references public.episodes(id) on delete cascade,
  translator_id uuid not null references public.translators(id) on delete restrict,
  credit_role text not null default 'translator',
  primary key (episode_id, translator_id)
);

create table if not exists public.actors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.movie_actors (
  movie_id uuid not null references public.movies(id) on delete cascade,
  actor_id uuid not null references public.actors(id) on delete restrict,
  character_name text,
  primary key (movie_id, actor_id)
);

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.movie_genres (
  movie_id uuid not null references public.movies(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (movie_id, genre_id)
);

-- R2 object keys only; never store public credentials or permanent signed URLs.
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  object_key text not null unique,
  media_type text not null check (media_type in ('video','image','subtitle','other')),
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  status text not null default 'pending' check (status in ('pending','ready','failed')),
  created_at timestamptz not null default now()
);

alter table public.movie_parts
  add constraint movie_parts_media_asset_fk
  foreign key (media_asset_id) references public.media_assets(id) on delete set null;
alter table public.episodes
  add constraint episodes_media_asset_fk
  foreign key (media_asset_id) references public.media_assets(id) on delete set null;

create table if not exists public.watchlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

create table if not exists public.watch_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_part_id uuid references public.movie_parts(id) on delete cascade,
  episode_id uuid references public.episodes(id) on delete cascade,
  position_seconds integer not null default 0 check (position_seconds >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  check (num_nonnulls(movie_part_id, episode_id) = 1),
  unique (user_id, movie_part_id),
  unique (user_id, episode_id)
);

create table if not exists public.admin_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists movies_status_published_idx on public.movies(status, published_at desc);
create index if not exists episodes_status_published_idx on public.episodes(status, published_at desc);
create index if not exists movie_parts_movie_sort_idx on public.movie_parts(movie_id, sort_order);
create index if not exists translators_active_idx on public.translators(is_active, display_name);

-- Enable RLS on every exposed public table.
alter table public.translators enable row level security;
alter table public.movies enable row level security;
alter table public.movie_parts enable row level security;
alter table public.series enable row level security;
alter table public.seasons enable row level security;
alter table public.episodes enable row level security;
alter table public.movie_translators enable row level security;
alter table public.episode_translators enable row level security;
alter table public.actors enable row level security;
alter table public.movie_actors enable row level security;
alter table public.genres enable row level security;
alter table public.movie_genres enable row level security;
alter table public.media_assets enable row level security;
alter table public.watchlists enable row level security;
alter table public.watch_progress enable row level security;
alter table public.admin_audit_events enable row level security;

-- Admin authorization is based on server-controlled app_metadata, never user_metadata.
create policy "public read active translators" on public.translators
for select to anon, authenticated using (is_active or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage translators" on public.translators
for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read published movies" on public.movies
for select to anon, authenticated using (status = 'published' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage movies" on public.movies
for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read parts of published movies" on public.movie_parts
for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published')
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "admins manage movie parts" on public.movie_parts
for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read published series" on public.series
for select to anon, authenticated using (status = 'published' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins manage series" on public.series
for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read seasons of published series" on public.seasons
for select to anon, authenticated using (
  exists (select 1 from public.series s where s.id = series_id and s.status = 'published')
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "admins manage seasons" on public.seasons
for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read published episodes" on public.episodes
for select to anon, authenticated using (
  status = 'published' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "admins manage episodes" on public.episodes
for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read movie translator credits" on public.movie_translators
for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published')
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "admins manage movie translator credits" on public.movie_translators
for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read episode translator credits" on public.episode_translators
for select to anon, authenticated using (
  exists (select 1 from public.episodes e where e.id = episode_id and e.status = 'published')
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "admins manage episode translator credits" on public.episode_translators
for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read actors" on public.actors for select to anon, authenticated using (true);
create policy "admins manage actors" on public.actors for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read genres" on public.genres for select to anon, authenticated using (true);
create policy "admins manage genres" on public.genres for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public read movie genres" on public.movie_genres for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published')
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "admins manage movie genres" on public.movie_genres for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage media assets" on public.media_assets for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "users manage own watchlists" on public.watchlists for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users manage own watch progress" on public.watch_progress for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "admins read audit events" on public.admin_audit_events for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins insert audit events" on public.admin_audit_events for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Explicit table grants complement RLS; RLS still determines which rows are visible.
grant select on public.translators, public.movies, public.movie_parts, public.series,
  public.seasons, public.episodes, public.movie_translators, public.episode_translators,
  public.actors, public.movie_actors, public.genres, public.movie_genres to anon, authenticated;
grant all on public.translators, public.movies, public.movie_parts, public.series,
  public.seasons, public.episodes, public.movie_translators, public.episode_translators,
  public.actors, public.movie_actors, public.genres, public.movie_genres,
  public.media_assets, public.admin_audit_events to authenticated;
grant all on public.watchlists, public.watch_progress to authenticated;
