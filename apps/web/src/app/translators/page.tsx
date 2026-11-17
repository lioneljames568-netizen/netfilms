import { Languages, ArrowLeft } from "lucide-react";
import { getActiveTranslators } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function TranslatorsPage() {
  const translators = await getActiveTranslators();
  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/" className="text-sm text-white/60 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Home</a></div></header>
    <section className="container-nf py-12"><div className="flex items-center gap-2 text-brand"><Languages size={16}/><span className="text-xs font-bold uppercase tracking-[.2em]">People behind the stories</span></div><h1 className="mt-3 text-4xl font-black sm:text-5xl">Our translators</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Meet the language contributors credited on published NetFilms titles.</p>
      {translators.length ? <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{translators.map(person=><a href={`/translators/${person.slug}`} key={person.id} className="block rounded-2xl border border-white/10 bg-panel p-6 transition hover:border-brand/50"><div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-brand/15 text-lg font-black text-red-300">{person.profile_photo_url ? <img src={person.profile_photo_url} alt="" className="h-full w-full object-cover"/> : person.full_name.split(/\\s+/).map(part=>part[0]).slice(0,2).join("")}</div><h2 className="mt-5 text-lg font-bold">{person.full_name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-white/50">{person.biography || "Kinyarwanda translator."}</p><div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/45">{person.movie_count} published {person.movie_count===1?"title":"titles"}</div></a>)}</div> : <div className="mt-9 rounded-2xl border border-dashed border-white/15 p-10 text-center"><h2 className="text-xl font-bold">Translator profiles will appear here</h2><p className="mt-2 text-sm text-white/45">No active translator profiles have been published yet.</p></div>}
    </section>
  </main>;
}
