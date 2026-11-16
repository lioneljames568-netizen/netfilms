import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, PlayCircle, Languages } from "lucide-react";
import { demoMovies } from "@/lib/catalog";

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = demoMovies.find(item => item.id === id);
  if (!movie) notFound();

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/movies" className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Movies</a></div></header>
    <section className="container-nf grid gap-9 py-12 md:grid-cols-[280px_1fr] md:py-20">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10"><Image src={movie.poster} alt="" fill sizes="280px" unoptimized className="object-cover"/></div>
      <div className="self-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Kinyarwanda translation</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">{movie.title}</h1><p className="mt-4 text-sm text-white/50">{movie.year} · {movie.genre} · {movie.quality}</p><div className="mt-7 flex items-center gap-3 rounded-xl border border-white/10 bg-panel p-4"><Languages className="text-brand"/><div><p className="text-[10px] uppercase tracking-widest text-white/40">Translator</p><p className="mt-1 font-bold">{movie.translator}</p></div></div><section className="mt-7"><h2 className="mb-3 text-lg font-black">Movie parts</h2><div className="space-y-2">{(movie.parts ?? [{ number: 1, title: "Full movie", duration: "Duration not listed" }]).map(part => <div key={part.number} className="flex items-center justify-between rounded-xl border border-white/10 bg-panel p-4"><div><p className="text-sm font-bold">Part {part.number}: {part.title}</p><p className="mt-1 text-xs text-white/40">{part.duration}</p></div><span className="text-xs text-white/35">Not available yet</span></div>)}</div></section><div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-5"><p className="font-bold text-amber-200">Streaming is not configured yet</p><p className="mt-2 text-sm leading-6 text-white/55">This is a demonstration catalogue entry. An authorized video source must be added through the admin media workflow before playback can be enabled.</p></div><button disabled className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-white/10 px-5 py-3 text-sm font-bold text-white/40"><PlayCircle size={18}/> Watch unavailable</button></div>
    </section>
  </main>;
}
