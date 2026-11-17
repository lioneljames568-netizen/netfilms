import { NextRequest, NextResponse } from "next/server";
import { getPublishedMovies, getPublishedSeries, getActiveTranslators } from "@/lib/catalog-data";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  if (query.length < 2) return NextResponse.json({ query, movies: [], series: [], translators: [], actors: [] });

  const needle = query.toLocaleLowerCase();
  const [movies, series, translators] = await Promise.all([
    getPublishedMovies(), getPublishedSeries(), getActiveTranslators(),
  ]);
  const matchedMovies = movies.filter(movie =>
    [movie.title, movie.description, ...movie.genres, ...movie.translators.map(person => person.full_name)]
      .some(value => value.toLocaleLowerCase().includes(needle))
  );
  const matchedSeries = series.filter(item =>
    [item.title, item.description, ...item.seasons.flatMap(season =>
      [season.title || "", ...season.episodes.flatMap(episode =>
        [episode.title, episode.description, ...episode.translators.map(person => person.full_name)]
      )]
    )].some(value => value.toLocaleLowerCase().includes(needle))
  );
  const matchedTranslators = translators.filter(person =>
    [person.full_name, person.biography].some(value => value.toLocaleLowerCase().includes(needle))
  );

  let actors: { id: string; slug: string; full_name: string }[] = [];
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.from("actors")
      .select("id, slug, full_name, movie_actors(movies(slug, title, status))")
      .ilike("full_name", `%${query.replace(/[,%_]/g, " ").trim()}%`)
      .limit(12);
    actors = (data || []).map((actor: any) => ({
      id: actor.id,
      slug: actor.slug,
      full_name: actor.full_name,
    }));
  }

  return NextResponse.json({
    query,
    movies: matchedMovies.slice(0, 30).map(movie => ({
      id: movie.slug, title: movie.title, year: movie.release_year,
      genre: movie.genres.join(" · "), translator: movie.translators.map(person => person.full_name).join(", "),
      poster: movie.poster_url,
    })),
    series: matchedSeries.slice(0, 20).map(item => ({ slug: item.slug, title: item.title, year: item.release_year })),
    translators: matchedTranslators.slice(0, 20).map(person => ({
      slug: person.slug, name: person.full_name, count: person.movie_count,
    })),
    actors,
  }, { headers: { "Cache-Control": "no-store" } });
}
