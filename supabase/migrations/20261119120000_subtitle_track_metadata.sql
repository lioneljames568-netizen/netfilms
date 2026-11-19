-- Store the language metadata required to expose episode subtitle files as native WebVTT tracks.
alter table public.media_assets
  add column if not exists subtitle_label text,
  add column if not exists subtitle_language text;

update public.media_assets
set subtitle_label = coalesce(nullif(subtitle_label, ''), 'Kinyarwanda'),
    subtitle_language = coalesce(nullif(subtitle_language, ''), 'rw')
where kind = 'subtitle';

alter table public.media_assets
  add constraint subtitle_assets_require_track_metadata
  check (
    kind <> 'subtitle'
    or (
      subtitle_label is not null
      and char_length(subtitle_label) between 1 and 80
      and subtitle_language is not null
      and subtitle_language ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'
    )
  );
