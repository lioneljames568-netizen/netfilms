import { Languages, ArrowLeft } from "lucide-react";
import { demoMovies } from "@/lib/catalog";

const people = [
  { name: "NetFilms Studio", bio: "The NetFilms translation team bringing selected stories to Kinyarwanda audiences.", initials: "NF" },
  { name: "Aline Uwase", bio: "Translator and language contributor.", initials: "AU" },
  { name: "Jean Claude", bio: "Translator and language contributor.", initials: "JC" },
  { name: "Mutesi Diane", bio: "Translator and language contributor.", initials: "MD" },
  { name: "Eric N.", bio: "Translator and language contributor.", initials: "EN" },
];

export default function TranslatorsPage() {
  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span></a><a href="/" className="text-sm text-white/60 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Home</a></div></header>
    <section className="container-nf py-12"><div className="flex items-center gap-2 text-brand"><Languages size={16}/><span className="text-xs font-bold uppercase tracking-[.2em]">People behind the stories</span></div><h1 className="mt-3 text-4xl font-black sm:text-5xl">Our translators</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Meet the language contributors associated with the NetFilms catalogue.</p>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{people.map(person=>{const count=demoMovies.filter(m=>m.translator===person.name).length;return <article key={person.name} className="rounded-2xl border border-white/10 bg-panel p-6"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-lg font-black text-red-300">{person.initials}</div><h2 className="mt-5 text-lg font-bold">{person.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-white/50">{person.bio}</p><div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/45">{count} sample {count===1?"title":"titles"} in catalogue</div></article>})}</div>
      <p className="mt-8 text-[11px] text-white/30">These are placeholder profiles for layout development. Replace with verified translator records before launch.</p>
    </section>
  </main>;
}
