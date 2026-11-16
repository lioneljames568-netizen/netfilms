import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, PlayCircle, Languages } from "lucide-react";
import { demoSeries } from "@/lib/series";

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = demoSeries.find(item => item.slug === slug);
  if (!series) notFound();

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/series" className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Series</a></div></header>
    <section className="container-nf py-10">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/10"><Image src={series.poster} alt="" fill sizes="300px" unoptimized className="object-cover"/></div>
        <div className="self-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Kinyarwanda series</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">{series.title}</h1><p className="mt-4 text-sm text-white/50">{series.year} · {series.genre}</p><p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">{series.synopsis}</p><div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-panel p-4"><Languages className="text-brand"/><div><p className="text-[10px] uppercase tracking-widest text-white/40">Translator</p><p className="mt-1 font-bold">{series.translator}</p></div></div></div>
      </div>
      <div className="mt-12 space-y-8">{series.seasons.map(season => <section key={season.number}><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-brand">Season {season.number}</p><h2 className="mt-1 text-2xl font-black">{season.title}</h2></div><span className="text-xs text-white/40">{season.episodes.length} episodes</span></div><div className="space-y-2">{season.episodes.map(episode => <article key={episode.number} className="flex items-center gap-4 rounded-xl border border-white/10 bg-panel p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[.06] text-sm font-black text-white/60">{episode.number}</span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">Episode {episode.number}: {episode.title}</h3><p className="mt-1 text-xs text-white/40">{episode.duration}</p></div><span className="inline-flex items-center gap-2 rounded-lg bg-white/[.06] px-3 py-2 text-xs text-white/40"><PlayCircle size={15}/> Coming soon</span></article>)}</div></section>)}</div>
      <p className="mt-8 text-[11px] text-white/35">Episode entries are placeholders. Playback stays disabled until an authorized media asset is configured.</p>
    </section>
  </main>;
}
