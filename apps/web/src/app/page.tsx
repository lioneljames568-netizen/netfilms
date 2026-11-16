"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Search, Menu, X, Play, Plus, Check, ChevronRight, Flame, Clapperboard, Languages, Bookmark, ArrowRight, Sparkles } from "lucide-react";
import { demoMovies, featuredMovie, type DemoMovie } from "@/lib/catalog";

function Brand() {
  return <a href="#" aria-label="NetFilms home" className="flex items-center gap-2.5">
    <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand text-2xl font-black tracking-tighter">N</span>
    <span className="text-[22px] font-black tracking-[-1.2px]">NET<span className="text-brand">FILMS</span></span>
  </a>;
}

function MovieCard({ movie, saved, onToggle }: { movie: DemoMovie; saved: boolean; onToggle: (id: string) => void }) {
  return <article className="group min-w-0">
    <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.06] bg-card">
      <Image src={movie.poster} alt="" fill sizes="(max-width: 640px) 42vw, (max-width: 1024px) 24vw, 16vw" className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/15 opacity-80" />
      {movie.label && <span className="absolute left-2.5 top-2.5 rounded bg-brand px-2 py-1 text-[9px] font-black tracking-widest">{movie.label}</span>}
      <button onClick={() => onToggle(movie.id)} aria-label={saved ? "Remove from My List" : "Add to My List"} className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur transition hover:bg-brand">
        {saved ? <Check size={15} /> : <Plus size={15} />}
      </button>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[.18em] text-red-300">{movie.quality} <span className="text-white/40">·</span> {movie.year}</p>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">{movie.title}</h3>
      </div>
    </div>
    <p className="mt-2 truncate text-[11px] text-white/45">{movie.genre} <span className="px-1 text-white/20">·</span> {movie.translator}</p>
  </article>;
}

function MovieRow({ title, subtitle, icon, movies, saved, onToggle }: { title: string; subtitle: string; icon: React.ReactNode; movies: DemoMovie[]; saved: string[]; onToggle: (id: string) => void }) {
  return <section className="container-nf mt-12">
    <div className="mb-5 flex items-end justify-between gap-4">
      <div><div className="mb-2 flex items-center gap-2 text-brand">{icon}<span className="text-[10px] font-bold uppercase tracking-[.2em]">{subtitle}</span></div><h2 className="text-2xl font-black tracking-tight sm:text-[28px]">{title}</h2></div>
      <a href="/movies" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-white/55 transition hover:text-white">View all <ChevronRight size={15}/></a>
    </div>
    <div className="movie-scroll grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {movies.map(movie => <MovieCard key={movie.id} movie={movie} saved={saved.includes(movie.id)} onToggle={onToggle}/>)}
    </div>
  </section>;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const filtered = useMemo(() => demoMovies.filter(m => (m.title + m.translator + m.genre).toLowerCase().includes(query.toLowerCase())), [query]);
  const toggleSaved = (id: string) => setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

  return <main className="min-h-screen overflow-hidden bg-ink pb-16">
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/90 backdrop-blur-xl">
      <div className="container-nf flex h-[72px] items-center justify-between gap-6">
        <Brand />
        <nav className="hidden items-center gap-8 text-[13px] font-semibold text-white/65 md:flex">
          <a className="text-white" href="#">Home</a><a className="transition hover:text-white" href="/movies">Movies</a><a className="transition hover:text-white" href="/translators">Translators</a><a className="transition hover:text-white" href="/my-list">My List</a>
        </nav>
        <div className="flex items-center gap-2">
          {searchOpen && <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search movies or translators..." className="w-40 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs outline-none focus:border-brand sm:w-64"/>}
          <button onClick={() => { setSearchOpen(v => !v); setQuery(""); }} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"><Search size={19}/></button>
          <a href="/my-list" className="hidden rounded-full border border-white/15 px-4 py-2 text-xs font-bold sm:block">My List <span className="ml-1 text-brand">{saved.length || ""}</span></a>
          <button onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 md:hidden">{menuOpen ? <X/> : <Menu/>}</button>
        </div>
      </div>
      {menuOpen && <nav className="container-nf flex flex-col gap-4 border-t border-white/10 py-5 text-sm md:hidden"><a href="#">Home</a><a href="/movies">Movies</a><a href="/translators">Translators</a><a href="/my-list">My List</a></nav>}
    </header>

    <section className="relative min-h-[590px] border-b border-white/[0.06] sm:min-h-[650px]">
      <Image src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2200&q=90" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-65" unoptimized/>
      <div className="hero-shade absolute inset-0"/>
      <div className="container-nf relative flex min-h-[590px] items-end pb-14 pt-24 sm:min-h-[650px] sm:items-center sm:pb-10">
        <div className="max-w-[610px]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-red-200"><Sparkles size={13}/> Featured collection</div>
          <p className="mb-3 text-xs font-bold tracking-[.25em] text-brand">NETFILMS ORIGINAL EXPERIENCE</p>
          <h1 className="max-w-[600px] text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-7xl">{featuredMovie.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-white/65"><span>{featuredMovie.year}</span><span className="h-1 w-1 rounded-full bg-brand"/><span>{featuredMovie.genre}</span><span className="h-1 w-1 rounded-full bg-brand"/><span className="text-white">{featuredMovie.quality}</span><span className="rounded border border-white/20 px-2 py-1 text-[9px] tracking-wider">KINYARWANDA</span></div>
          <p className="mt-5 max-w-[470px] text-sm leading-7 text-white/65">{featuredMovie.description}</p>
          <p className="mt-4 text-xs text-white/55">Translated by <strong className="text-white">{featuredMovie.translator}</strong></p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/movies" className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3.5 text-sm font-extrabold shadow-lg shadow-brand/20 transition hover:bg-brand-dark"><Play size={17} fill="currentColor"/> Explore movies</a>
            <a href="/translators" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.07] px-6 py-3.5 text-sm font-bold backdrop-blur transition hover:bg-white/15"><Languages size={17}/> Meet translators</a>
          </div>
          <p className="mt-5 text-[10px] text-white/35">Featured artwork and catalogue entries are demonstration placeholders.</p>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 hidden gap-2 p-8 lg:flex"><span className="h-1 w-9 rounded-full bg-brand"/><span className="h-1 w-4 rounded-full bg-white/30"/><span className="h-1 w-4 rounded-full bg-white/30"/></div>
    </section>

    {query && <section className="container-nf mt-8"><p className="mb-4 text-sm text-white/55">Search results for <strong className="text-white">“{query}”</strong></p>{filtered.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">{filtered.map(movie => <MovieCard key={movie.id} movie={movie} saved={saved.includes(movie.id)} onToggle={toggleSaved}/>)}</div> : <p className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/50">No matches yet. Try another title or translator.</p>}</section>}
    <MovieRow title="Trending this week" subtitle="Popular right now" icon={<Flame size={15}/>} movies={demoMovies.slice(0, 6)} saved={saved} onToggle={toggleSaved}/>
    <MovieRow title="Fresh from the studio" subtitle="Recently added" icon={<Clapperboard size={15}/>} movies={[...demoMovies].reverse()} saved={saved} onToggle={toggleSaved}/>

    <section className="container-nf mt-16">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111] p-7 sm:p-10">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-brand/15 blur-3xl"/>
        <div className="relative max-w-xl"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-brand">The voices behind the stories</p><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Stories travel further in your language.</h2><p className="mt-3 text-sm leading-6 text-white/55">Discover the translators bringing stories to Kinyarwanda audiences, and explore the work behind every film.</p><a href="/translators" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-red-300">Explore translators <ArrowRight size={16}/></a></div>
      </div>
    </section>

    <footer className="container-nf mt-16 border-t border-white/10 pt-8">
      <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center"><div><Brand/><p className="mt-3 text-xs text-white/40">Movies in Kinyarwanda.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/50"><a href="/about" className="hover:text-white">About</a><a href="/contact" className="hover:text-white">Contact</a><a href="/privacy" className="hover:text-white">Privacy</a><a href="/terms" className="hover:text-white">Terms</a><a href="https://wa.me/250794974962" target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a></div></div>
      <div className="mt-8 flex flex-col justify-between gap-2 border-t border-white/[0.06] py-5 text-[10px] text-white/30 sm:flex-row"><span>© {new Date().getFullYear()} NetFilms. All rights reserved.</span><span>Only authorized Kinyarwanda-translated content.</span></div>
    </footer>
    <div className="fixed bottom-5 right-5 z-40 sm:hidden"><a href="https://wa.me/250794974962" target="_blank" rel="noreferrer" aria-label="Contact NetFilms on WhatsApp" className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-xl font-bold text-black shadow-xl">W</a></div>
  </main>;
}
