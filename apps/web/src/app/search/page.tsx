"use client";

import { useState } from "react";\nimport type { FormEvent } from "react";
import Image from "next/image";
import { Search, ArrowLeft, Film, Clapperboard, Languages, UserRound } from "lucide-react";

type Results = {
  movies: { id: string; title: string; year: number | null; genre: string; translator: string; poster: string | null }[];
  series: { slug: string; title: string; year: number | null }[];
  translators: { slug: string; name: string; count: number }[];
  actors: { id: string; slug: string; full_name: string }[];
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>({ movies: [], series: [], translators: [], actors: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Search unavailable");
      setResults(await response.json());
    } catch {
      setResults({ movies: [], series: [], translators: [], actors: [] });
    } finally { setLoading(false); }
  }
  const total = results.movies.length + results.series.length + results.translators.length + results.actors.length;
  return <main className="min-h-screen bg-ink text-white pb-20">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/" className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Home</a></div></header>
    <section className="container-nf py-12">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Find your next story</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Search NetFilms</h1>
      <p className="mt-3 text-sm text-white/50">Search movie titles, genres, translators, actors, series, seasons and episodes.</p>
      <form onSubmit={submit} className="mt-8 flex gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-panel px-4"><Search size={18} className="shrink-0 text-white/40"/><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="Movie, actor, translator, series…" className="h-14 min-w-0 w-full bg-transparent text-sm outline-none"/></label>
        <button disabled={loading || query.trim().length < 2} className="rounded-xl bg-brand px-5 text-sm font-bold disabled:opacity-40">{loading ? "Searching…" : "Search"}</button>
      </form>
      {searched && !loading && <p className="mt-7 text-xs text-white/45">{total} matching result{total===1?"":"s"} for <strong className="text-white">“{query}”</strong></p>}
      {loading && <p className="mt-10 text-sm text-white/45">Searching the published catalogue…</p>}
      {searched && !loading && total===0 && <div className="mt-8 rounded-xl border border-dashed border-white/15 p-10 text-center"><h2 className="font-bold">No results found</h2><p className="mt-2 text-sm text-white/45">Try a different spelling or search term.</p></div>}
      {results.movies.length>0 && <section className="mt-8"><h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Film size={18} className="text-brand"/> Movies</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{results.movies.map(movie=><a key={movie.id} href={`/movies/${movie.id}`} className="min-w-0"><div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-card poster-fallback">{movie.poster && <Image src={movie.poster} alt="" fill unoptimized sizes="20vw" className="object-cover"/>}</div><h3 className="mt-2 text-sm font-bold">{movie.title}</h3><p className="mt-1 text-[11px] text-white/45">{movie.year || "—"} · {movie.genre}</p><p className="mt-1 text-[11px] text-white/55">{movie.translator}</p></a>)}</div></section>}
      {results.series.length>0 && <section className="mt-9"><h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Clapperboard size={18} className="text-brand"/> Series</h2><div className="grid gap-3 sm:grid-cols-2">{results.series.map(item=><a key={item.slug} href={`/series/${item.slug}`} className="rounded-xl border border-white/10 bg-panel p-5 hover:border-brand/40"><h3 className="font-bold">{item.title}</h3><p className="mt-1 text-xs text-white/45">{item.year || "Year not listed"}</p></a>)}</div></section>}
      {results.translators.length>0 && <section className="mt-9"><h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Languages size={18} className="text-brand"/> Translators</h2><div className="grid gap-3 sm:grid-cols-2">{results.translators.map(person=><a key={person.slug} href={`/translators/${person.slug}`} className="rounded-xl border border-white/10 bg-panel p-5 hover:border-brand/40"><h3 className="font-bold">{person.name}</h3><p className="mt-1 text-xs text-white/45">{person.count} published title(s)</p></a>)}</div></section>}
      {results.actors.length>0 && <section className="mt-9"><h2 className="mb-4 flex items-center gap-2 text-lg font-black"><UserRound size={18} className="text-brand"/> Actors</h2><div className="grid gap-3 sm:grid-cols-2">{results.actors.map(actor=><div key={actor.id} className="rounded-xl border border-white/10 bg-panel p-5"><h3 className="font-bold">{actor.full_name}</h3></div>)}</div></section>}
    </section>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/10 bg-black/95 px-2 py-2 text-[10px] text-white/55 backdrop-blur sm:hidden"><a href="/" className="flex flex-col items-center gap-1 py-1">⌂<span>Home</span></a><a href="/movies" className="flex flex-col items-center gap-1 py-1">▣<span>Movies</span></a><a href="/translators" className="flex flex-col items-center gap-1 py-1">文<span>People</span></a><a href="/search" aria-current="page" className="flex flex-col items-center gap-1 py-1 text-brand">⌕<span>Search</span></a><a href="/my-list" className="flex flex-col items-center gap-1 py-1">♡<span>My List</span></a></nav>
  </main>;
}
