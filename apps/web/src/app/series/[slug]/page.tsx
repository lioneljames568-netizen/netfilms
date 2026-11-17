import { notFound } from "next/navigation";
import { ArrowLeft, PlayCircle, Languages } from "lucide-react";
import { getPublishedSeriesBySlug } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

function duration(seconds: number | null) {
  if (!seconds) return "Duration not listed";
  const minutes = Math.round(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`;
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await getPublishedSeriesBySlug(slug);
  if (!series) notFound();

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/series" className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Series</a></div></header>
    <section className="container-nf py-10">
      <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Kinyarwanda series</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">{series.title}</h1><p className="mt-4 text-sm text-white/50">{series.release_year ?? "Year not listed"} · {series.seasons.length} season(s)</p><p className="mt-5 text-sm leading-7 text-white/65">{series.description}</p></div>
      <div className="mt-12 space-y-8">{series.seasons.map(season=><section key={season.id}><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-brand">Season {season.season_number}</p><h2 className="mt-1 text-2xl font-black">{season.title || `Season ${season.season_number}`}</h2></div><span className="text-xs text-white/40">{season.episodes.length} episodes</span></div><div className="space-y-2">{season.episodes.map(episode=><article key={episode.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-panel p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[.06] text-sm font-black text-white/60">{episode.episode_number}</span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">Episode {episode.episode_number}: {episode.title}</h3><p className="mt-1 text-xs text-white/40">{duration(episode.duration_seconds)}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-white/45"><Languages size={11}/>{episode.translators.map(person=>person.full_name).join(", ") || "Translator credit unavailable"}</p></div><span className="inline-flex items-center gap-2 rounded-lg bg-white/[.06] px-3 py-2 text-xs text-white/40"><PlayCircle size={15}/> Playback pending</span></article>)}</div></section>)}</div>
      <div className="mt-10 rounded-xl border border-amber-500/20 bg-amber-500/[.06] p-5"><p className="font-bold text-amber-200">Playback is not enabled yet</p><p className="mt-2 text-sm leading-6 text-white/55">Episode playback will be activated only after authorized video assets and secure streaming delivery are configured.</p></div>
    </section>
  </main>;
}
