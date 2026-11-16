import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return <main className="min-h-screen bg-ink text-white"><div className="container-nf py-12"><a href="/" className="text-sm text-white/50 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Home</a><section className="mt-16 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">About us</p><h1 className="mt-3 text-4xl font-black">Movies in Kinyarwanda.</h1><p className="mt-5 text-base leading-8 text-white/60">NetFilms is being built as a home for discovering movies translated into Kinyarwanda, while recognizing the translators who bring those stories to local audiences.</p><p className="mt-4 text-sm leading-7 text-white/45">The platform will publish only content for which the team has the appropriate distribution and streaming permissions.</p></section></div></main>;
}
