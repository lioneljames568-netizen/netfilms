import { getSupabase } from "@/lib/supabase";

export type MovieRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  release_year: number | null;
  duration_seconds: number | null;
  video_quality: string | null;
  kind: "standalone" | "part";
  is_featured: boolean;
  is_trending: boolean;
  published_at: string | null;
  translators: { id: string; slug: string; full_name: string }[];
  genres: string[];
  poster_url: string | null;
  parts: { part_number: number; collection_id: string; collection_title: string | null; total_parts: number | null; siblings: { id: string; slug: string; title: string; part_number: number }[] }[];
};

export type TranslatorRecord = {
  id: string;
  slug: string;
  full_name: string;
  biography: string;
  profile_photo_url: string | null;
  movie_count: number;
};

export type SeriesRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  release_year: number | null;
  seasons: {
    id: string;
    season_number: number;
    title: string | null;
    episodes: {
      id: string;
      episode_number: number;
      title: string;
      description: string;
      duration_seconds: number | null;
      translators: { id: string; slug: string; full_name: string }[];
    }[];
  }[];
};

function asArray<T>(value: unknown): T[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]) as T[];
}

export async function getPublishedMovies(): Promise<MovieRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("movies")
    .select(`
      id, slug, title, description, release_year, duration_seconds, video_quality,
      kind, is_featured, is_trending, published_at,
      movie_translators(translators(id, slug, full_name)),
      movie_genres(genres(name)),
      movie_media(kind, media_assets(external_url)),
      movie_parts(part_number, collection_id, movie_collections(id, title, total_parts))
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("NetFilms catalog query failed:", error.message);
    return [];
  }

  const rows = data ?? [];
  const collectionIds = Array.from(new Set(rows.flatMap((row) =>
    asArray<{ collection_id: string }>((row as unknown as Record<string, unknown>).movie_parts)
      .map((part) => part.collection_id)
      .filter(Boolean),
  )));

  // Fetch collection siblings separately to avoid a cyclic PostgREST embed
  // (movies -> movie_parts -> movie_collections -> movie_parts -> movies).
  const siblingsByCollection = new Map<string, { id: string; slug: string; title: string; part_number: number }[]>();
  if (collectionIds.length > 0) {
    const { data: siblingRows, error: siblingError } = await supabase
      .from("movie_parts")
      .select("collection_id, part_number, movies!inner(id, slug, title, status)")
      .in("collection_id", collectionIds)
      .eq("movies.status", "published")
      .order("part_number", { ascending: true });

    if (siblingError) {
      console.error("NetFilms movie-part navigation query failed:", siblingError.message);
    } else {
      for (const rawPart of siblingRows ?? []) {
        const part = rawPart as unknown as {
          collection_id: string;
          part_number: number;
          movies: unknown;
        };
        const publishedMovies = asArray<{ id: string; slug: string; title: string; status: string }>(part.movies)
          .filter((candidate) => candidate.status === "published")
          .map((candidate) => ({
            id: candidate.id,
            slug: candidate.slug,
            title: candidate.title,
            part_number: part.part_number,
          }));
        const existing = siblingsByCollection.get(part.collection_id) ?? [];
        siblingsByCollection.set(part.collection_id, [...existing, ...publishedMovies]);
      }
    }
  }

  return rows.map((row) => {
    const item = row as unknown as Record<string, unknown>;
    const translatorLinks = asArray<{ translators: unknown }>(item.movie_translators);
    const genreLinks = asArray<{ genres: unknown }>(item.movie_genres);
    const mediaLinks = asArray<{ kind: string; media_assets: unknown }>(item.movie_media);
    const partLinks = asArray<{
      part_number: number;
      collection_id: string;
      movie_collections: unknown;
    }>(item.movie_parts);
    const poster = mediaLinks.find((link) => link.kind === "poster");
    const posterAsset = poster ? asArray<{ external_url: string | null }>(poster.media_assets)[0] : null;

    return {
      id: String(item.id),
      slug: String(item.slug),
      title: String(item.title),
      description: String(item.description ?? ""),
      release_year: item.release_year as number | null,
      duration_seconds: item.duration_seconds as number | null,
      video_quality: item.video_quality as string | null,
      kind: item.kind as "standalone" | "part",
      is_featured: Boolean(item.is_featured),
      is_trending: Boolean(item.is_trending),
      published_at: item.published_at as string | null,
      translators: translatorLinks.flatMap((link) => asArray<{ id: string; slug: string; full_name: string }>(link.translators)),
      genres: genreLinks.flatMap((link) => asArray<{ name: string }>(link.genres).map((genre) => genre.name)),
      poster_url: posterAsset?.external_url ?? null,
      parts: partLinks.map((link) => {
        const collection = asArray<{ id: string; title: string; total_parts: number | null }>(link.movie_collections)[0];
        return {
          part_number: link.part_number,
          collection_id: link.collection_id,
          collection_title: collection?.title ?? null,
          total_parts: collection?.total_parts ?? null,
          siblings: siblingsByCollection.get(link.collection_id) ?? [],
        };
      }),
    } satisfies MovieRecord;
  });
}

export async function getPublishedMovieBySlug(slug: string): Promise<MovieRecord | null> {
  const movies = await getPublishedMovies();
  return movies.find((movie) => movie.slug === slug) ?? null;
}

export async function getActiveTranslators(): Promise<TranslatorRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("translators")
    .select("id, slug, full_name, biography, profile_photo_url, movie_translators(movies(id))")
    .eq("is_active", true)
    .order("full_name");
  if (error) {
    console.error("NetFilms translator query failed:", error.message);
    return [];
  }
  return (data ?? []).map((row) => {
    const item = row as unknown as Record<string, unknown>;
    const links = asArray<{ movies: unknown }>(item.movie_translators);
    const movieIds = new Set(links.flatMap((link) => asArray<{ id: string }>(link.movies).map((movie) => movie.id)));
    return {
      id: String(item.id),
      slug: String(item.slug),
      full_name: String(item.full_name),
      biography: String(item.biography ?? ""),
      profile_photo_url: item.profile_photo_url as string | null,
      movie_count: movieIds.size,
    };
  });
}

export async function getActiveTranslatorBySlug(slug: string): Promise<TranslatorRecord | null> {
  const translators = await getActiveTranslators();
  return translators.find((person) => person.slug === slug) ?? null;
}

export async function getPublishedSeries(): Promise<SeriesRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("series")
    .select(`
      id, slug, title, description, release_year,
      seasons(id, season_number, title, episodes(
        id, episode_number, title, description, duration_seconds,
        episode_translators(translators(id, slug, full_name))
      ))
    `)
    .eq("status", "published")
    .order("title");
  if (error) {
    console.error("NetFilms series query failed:", error.message);
    return [];
  }
  return (data ?? []).map((row) => {
    const item = row as unknown as Record<string, unknown>;
    const seasons = asArray<Record<string, unknown>>(item.seasons).map((season) => ({
      id: String(season.id),
      season_number: Number(season.season_number),
      title: season.title as string | null,
      episodes: asArray<Record<string, unknown>>(season.episodes).map((episode) => ({
        id: String(episode.id),
        episode_number: Number(episode.episode_number),
        title: String(episode.title),
        description: String(episode.description ?? ""),
        duration_seconds: episode.duration_seconds as number | null,
        translators: asArray<{ episode_translators?: unknown }>([{ episode_translators: episode.episode_translators }])
          .flatMap((entry) => asArray<{ translators: unknown }>(entry.episode_translators))
          .flatMap((link) => asArray<{ id: string; slug: string; full_name: string }>(link.translators)),
      })),
    }));
    return {
      id: String(item.id),
      slug: String(item.slug),
      title: String(item.title),
      description: String(item.description ?? ""),
      release_year: item.release_year as number | null,
      seasons,
    };
  });
}

export async function getPublishedSeriesBySlug(slug: string): Promise<SeriesRecord | null> {
  const series = await getPublishedSeries();
  return series.find((item) => item.slug === slug) ?? null;
}
