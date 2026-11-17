import { ArrowLeft, ShieldCheck } from "lucide-react";
import { NetFilmsPlayer } from "@/components/NetFilmsPlayer";

export const dynamic = "force-dynamic";

type Playback = { title: string; src: string; content_type?: string | null };

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
  let playback: Playback | null = null;
  let message = "Playback is not available yet. An authorized video asset must be added and rights verification completed first.";
  try {
    const response = await fetch(`${apiBase}/api/v1/movies/${encodeURIComponent(slug)}/playback`, { cache: "no-store" });
    const data = await response.json();
    if (response.ok && data.src) playback = data as Playback;
    else if (data.detail) message = data.detail;
  } catch {
    message = "The streaming service is not connected yet. Please try again later.";
  }

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href={`/movies/${slug}`} className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Movie details</a></div></header>
    <section className="container-nf py-10">
      <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-300"><ShieldCheck size={15}/> Authorized playback</div>
      {playback ? <><h1 className="mb-5 text-2xl font-black sm:text-3xl">{playback.title}</h1><NetFilmsPlayer src={playback.src} title={playback.title}/><p className="mt-4 text-xs text-white/35">Playback link is temporary and protected. Do not share direct media URLs.</p></> : <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-white/15 bg-panel p-10 text-center"><h1 className="text-2xl font-black">This movie is not ready to stream</h1><p className="mt-3 text-sm leading-6 text-white/50">{message}</p><a href={`/movies/${slug}`} className="mt-6 inline-flex rounded-lg bg-brand px-5 py-3 text-xs font-bold">Back to movie details</a></div>}
    </section>
  </main>;
}
