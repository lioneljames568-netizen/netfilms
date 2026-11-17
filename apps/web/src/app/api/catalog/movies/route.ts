import { NextResponse } from "next/server";
import { getPublishedMovies } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const movies = await getPublishedMovies();
  const payload = movies.map((movie) => ({
    id: movie.slug,
    title: movie.title,
    year: movie.release_year ?? 0,
    genre: movie.genres.join(" · ") || "Uncategorized",
    quality: movie.video_quality ?? "HD",
    translator: movie.translators.map((person) => person.full_name).join(", "),
    poster: movie.poster_url ?? "",
    label: movie.is_trending ? "TRENDING" : movie.is_featured ? "FEATURED" : undefined,
    description: movie.description,
    parts: movie.parts.map((part) => ({
      number: part.part_number,
      title: part.collection_title ?? movie.title,
      duration: "Duration not listed",
    })),
  }));
  return NextResponse.json({ movies: payload }, {
    headers: { "Cache-Control": "no-store" },
  });
}
