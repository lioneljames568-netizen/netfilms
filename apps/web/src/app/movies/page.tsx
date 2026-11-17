"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { DemoMovie } from "@/lib/catalog";

export default function MoviesPage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [allMovies, setAllMovies] = useState<DemoMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog/movies")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Catalog unavailable")))
      .then((data) => setAllMovies(Array.isArray(data.movies) ? data.movies : []))
      .catch(() => setAllMovies([]))
      .finally(() => setLoading(false));
  }, []);

  const genres = ["All", ...Array.from(new Set(allMovies.map((movie) => movie.genre)))];
  const movies = useMemo(() => {
    const result = allMovies.filter((movie) =>
      (genre === "All" || movie.genre === genre) &&
      (movie.title + " " + movie.translator).toLowerCase().includes(query.toLowerCase())
    );
    return sort === "A–Z"
      ? [...result].sort((a, b) => a.title.localeCompare(b.title))
      : [...result].sort((a, b) => b.year - a.year);
  }, [allMovies, genre, query, sort]);

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/" className="text-sm text-white/60 hover:text-white">← Home</a></div></header>
    <section className="container-nf py-12">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Explore the collection</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">All movies</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Discover stories translated into Kinyarwanda. Every published title includes its translator credits.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-panel px-4"><Search size={17} className="text-white/40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search titles or translators" className="h-12 w-full bg-transparent text-sm outline-none"/></label>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-panel px-3"><SlidersHorizontal size={15} className="text-white/45"/><select value={genre} onChange={e=>setGenre(e.target.value)} className="h-12 bg-transparent pr-2 text-sm outline-none">{genres.map(g=><option key={g} value={g} className="bg-panel">{g}</option>)}</select></label>
        <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort movies" className="h-12 rounded-xl border border-white/10 bg-panel px-4 text-sm outline-none"><option>Newest</option><option>A–Z</option></select>
      </div>
      <p className="mb-5 mt-8 text-xs text-white/40">{loading ? "Loading published titles…" : `${movies.length} published titles`}</p>
      {loading ? <div className="rounded-xl border border-white/10 p-12 text-center text-sm text-white/50">Loading the published catalogue…</div> : movies.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{movies.map(movie=><article key={movie.id} className="min-w-0"><a href={`/movies/${movie.id}`}><div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-card poster-fallback">{movie.poster ? <Image src={movie.poster} alt="" fill sizes="(max-width:640px) 45vw, 18vw" unoptimized className="object-cover"/> : null}<span className="absolute bottom-2 left-2 z-10 rounded bg-black/75 px-2 py-1 text-[10px] font-bold">{movie.quality}</span></div><h2 className="mt-3 text-sm font-bold hover:text-red-300">{movie.title}</h2></a><p className="mt-1 text-[11px] text-white/45">{movie.year || "Year not listed"} · {movie.genre}</p><p className="mt-1 text-[11px] text-white/60">Translator: {movie.translator}</p></article>)}</div> : <div className="rounded-xl border border-dashed border-white/15 p-12 text-center"><h2 className="font-bold">No published movies yet</h2><p className="mt-2 text-sm text-white/45">New authorized Kinyarwanda titles will appear here when they are published.</p></div>}
      <p className="mt-10 text-center text-[11px] text-white/30">Only published titles with verified translator credits and distribution rights appear here.</p>
    </section>
  </main>;
}
