import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Languages } from "lucide-react";
import { getPublishedMovieBySlug } from "@/lib/catalog-data";
import { AddToMyListButton } from "@/components/AddToMyListButton";

export const dynamic = "force-dynamic";

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getPublishedMovieBySlug(id);
  if (!movie) notFound();

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/movies" className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Movies</a></div></header>
    <section className="container-nf grid gap-9 py-12 md:grid-cols-[280px_1fr] md:py-20">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10 poster-fallback">{movie.poster_url ? <Image src={movie.poster_url} alt={movie.title} fill sizes="280px" unoptimized className="object-cover"/> : null}</div>
      <div className="self-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Kinyarwanda translation</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">{movie.title}</h1><p className="mt-4 text-sm text-white/50">{movie.release_year ?? "Year not listed"} · {movie.genres.join(" · ") || "Genre not listed"} · {movie.video_quality ?? "Quality not listed"}</p><div className="mt-7 flex items-start gap-3 rounded-xl border border-white/10 bg-panel p-4"><Languages className="mt-1 text-brand"/><div><p className="text-[10px] uppercase tracking-widest text-white/40">Translator{movie.translators.length === 1 ? "" : "s"}</p>{movie.translators.map(person=><a key={person.id} href={`/translators/${person.slug}`} className="mt-1 block font-bold hover:text-red-300">{person.full_name}</a>)}</div></div>
      <p className="mt-7 whitespace-pre-line text-sm leading-7 text-white/65">{movie.description}</p>
      {movie.kind === "part" ? <section className="mt-7"><h2 className="mb-3 text-lg font-black">Movie part</h2><div className="rounded-xl border border-white/10 bg-panel p-4"><p className="text-sm font-bold">{movie.parts[0]?.collection_title ?? movie.title} — Part {movie.parts[0]?.part_number ?? 1}{movie.parts[0]?.total_parts ? ` of ${movie.parts[0].total_parts}` : ""}</p></div></section> : null}
      <div className="mt-8 flex flex-wrap items-center gap-3"><a href={`/watch/${movie.slug}`} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold hover:bg-brand-dark">Watch movie</a><AddToMyListButton movieId={movie.slug} /></div></div>
    </section>
  </main>;
}
