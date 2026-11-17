import { ArrowLeft, Clapperboard, ChevronRight } from "lucide-react";
import { getPublishedSeries } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  const series = await getPublishedSeries();
  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/" className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Home</a></div></header>
    <section className="container-nf py-12">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-brand"><Clapperboard size={15}/> Episodic stories</p>
      <h1 className="text-4xl font-black sm:text-5xl">Series</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Explore published series, seasons and episodes translated into Kinyarwanda.</p>
      {series.length ? <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{series.map(item=><a key={item.id} href={`/series/${item.slug}`} className="group rounded-2xl border border-white/10 bg-panel p-6 transition hover:border-brand/50"><p className="text-[10px] font-bold uppercase tracking-widest text-red-300">{item.release_year ?? "Year not listed"} · SERIES</p><h2 className="mt-3 text-xl font-black">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">{item.description}</p><div className="mt-5 flex items-center justify-between text-xs text-white/45"><span>{item.seasons.length} season(s) · {item.seasons.reduce((total,season)=>total+season.episodes.length,0)} episodes</span><ChevronRight size={16} className="text-brand"/></div></a>)}</div> : <div className="mt-9 rounded-2xl border border-dashed border-white/15 p-10 text-center"><h2 className="text-xl font-bold">No series published yet</h2><p className="mt-2 text-sm text-white/45">Published series will appear here when they are ready for viewers.</p></div>}
    </section>
  </main>;
}
