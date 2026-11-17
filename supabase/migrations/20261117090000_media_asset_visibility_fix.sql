-- Fix the media-assets visibility policy: compare the link's media_asset_id
-- with the media_assets row, not with the parent movie/episode id.
drop policy if exists "public reads published media references" on public.media_assets;

create policy "public reads published media references"
on public.media_assets
for select
to anon, authenticated
using (
  private.is_admin()
  or exists (
    select 1
    from public.movie_media mm
    join public.movies m on m.id = mm.movie_id
    where mm.media_asset_id = media_assets.id
      and m.status = 'published'
  )
  or exists (
    select 1
    from public.episode_media em
    join public.episodes e on e.id = em.episode_id
    where em.media_asset_id = media_assets.id
      and e.status = 'published'
  )
);
