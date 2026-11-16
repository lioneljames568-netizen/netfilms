-- Tighten series publication visibility and grant the trusted backend role explicitly.
drop policy if exists "public read published episodes" on public.episodes;
create policy "public read episodes in published series" on public.episodes
for select to anon, authenticated using (
  (
    status = 'published'
    and exists (
      select 1
      from public.seasons s
      join public.series sr on sr.id = s.series_id
      where s.id = season_id and sr.status = 'published'
    )
  )
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "public read episode translator credits" on public.episode_translators;
create policy "public read episode translator credits" on public.episode_translators
for select to anon, authenticated using (
  exists (
    select 1
    from public.episodes e
    join public.seasons s on s.id = e.season_id
    join public.series sr on sr.id = s.series_id
    where e.id = episode_id and e.status = 'published' and sr.status = 'published'
  )
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- The service role is used only by trusted server-side code and bypasses RLS.
grant all on public.translators, public.movies, public.movie_parts, public.series,
  public.seasons, public.episodes, public.movie_translators, public.episode_translators,
  public.actors, public.movie_actors, public.genres, public.movie_genres,
  public.media_assets, public.watchlists, public.watch_progress,
  public.admin_audit_events to service_role;
grant usage, select on all sequences in schema public to service_role;
