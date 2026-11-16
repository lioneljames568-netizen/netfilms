import Image from "next/image";
import { ArrowLeft, Clapperboard, ChevronRight } from "lucide-react";
import { demoSeries } from "@/lib/series";

export const metadata = { title: "Series" };

export default function SeriesPage() {
  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/" className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Home</a></div></header>
    <section className="container-nf py-12">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-brand"><Clapperboard size={15}/> Episodic stories</p>
      <h1 className="text-4xl font-black sm:text-5xl">Series</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Explore series, seasons and episodes translated into Kinyarwanda.</p>
      <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {demoSeries.map(series => <a key={series.slug} href={`/series/${series.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-panel transition hover:border-brand/50">
          <div className="relative aspect-[16/9] overflow-hidden"><Image src={series.poster} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" unoptimized className="object-cover transition duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/></div>
          <div className="p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-red-300">{series.year} · {series.genre}</p><h2 className="mt-2 text-xl font-black">{series.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">{series.synopsis}</p><div className="mt-4 flex items-center justify-between text-xs text-white/45"><span>{series.seasons.length} season(s) · {series.translator}</span><ChevronRight size={16} className="text-brand"/></div></div>
        </a>)}
      </div>
      <p className="mt-8 text-[11px] text-white/35">Illustrative catalogue records. Production listings will come from the authorized database.</p>
    </section>
  </main>;
}
