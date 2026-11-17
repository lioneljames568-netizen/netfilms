import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Languages } from "lucide-react";
import { getActiveTranslatorBySlug, getPublishedMovies } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function TranslatorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const translator = await getActiveTranslatorBySlug(slug);
  if (!translator) notFound();
  const movies = (await getPublishedMovies()).filter(movie => movie.translators.some(person => person.id === translator.id));

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/translators" className="text-sm text-white/55 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Translators</a></div></header>
    <section className="container-nf py-12"><div className="flex items-center gap-5"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand/15 text-2xl font-black text-red-300">{translator.profile_photo_url ? <img src={translator.profile_photo_url} alt="" className="h-full w-full object-cover"/> : translator.full_name.split(/\\s+/).map(part=>part[0]).slice(0,2).join("")}</div><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-brand"><Languages size={14}/> Translator profile</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{translator.full_name}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/50">{translator.biography}</p></div></div>
      <div className="mt-10 border-t border-white/10 pt-8"><h2 className="text-2xl font-black">Translated titles</h2><p className="mt-2 text-xs text-white/40">{movies.length} published titles</p>
        {movies.length ? <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{movies.map(movie=><a key={movie.id} href={`/movies/${movie.slug}`}><div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-card poster-fallback">{movie.poster_url ? <Image src={movie.poster_url} alt="" fill sizes="20vw" unoptimized className="object-cover"/> : null}</div><h3 className="mt-3 text-sm font-bold">{movie.title}</h3><p className="mt-1 text-[11px] text-white/45">{movie.release_year ?? "—"} · {movie.genres.join(" · ")}</p></a>)}</div> : <div className="mt-6 rounded-xl border border-dashed border-white/15 p-10 text-center text-sm text-white/45">No published titles are currently assigned to this translator.</div>}
      </div>
    </section>
  </main>;
}
