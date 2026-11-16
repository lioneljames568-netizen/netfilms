"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { demoMovies } from "@/lib/catalog";

const STORAGE_KEY = "netfilms:watchlist:v1";

export default function MyListPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { setIds([]); }
    setReady(true);
  }, []);
  const remove = (id: string) => {
    const next = ids.filter(item => item !== id);
    setIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const saved = demoMovies.filter(movie => ids.includes(movie.id));
  return <main className="min-h-screen bg-ink text-white"><header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/" className="text-sm text-white/60 hover:text-white">← Home</a></div></header>
    <section className="container-nf py-12"><div className="flex items-center gap-2 text-brand"><Bookmark size={16}/><span className="text-xs font-bold uppercase tracking-[.2em]">Your collection</span></div><h1 className="mt-3 text-4xl font-black">My List</h1><p className="mt-2 text-sm text-white/50">Titles you have saved on this device.</p>
      {!ready ? <p className="mt-10 text-sm text-white/50">Loading your list…</p> : saved.length ? <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{saved.map(movie=><article key={movie.id}><div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-card"><Image src={movie.poster} alt="" fill sizes="25vw" unoptimized className="object-cover"/></div><h2 className="mt-3 text-sm font-bold">{movie.title}</h2><p className="mt-1 text-[11px] text-white/45">Translator: {movie.translator}</p><button onClick={()=>remove(movie.id)} className="mt-3 inline-flex items-center gap-2 text-xs text-white/50 hover:text-red-300"><Trash2 size={13}/> Remove</button></article>)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center"><Bookmark className="mx-auto text-white/25" size={28}/><h2 className="mt-4 font-bold">Your list is waiting</h2><p className="mt-2 text-sm text-white/45">Save a title from the homepage to see it here.</p><a href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-3 text-xs font-bold">Discover movies</a></div>}
    </section></main>;
}
