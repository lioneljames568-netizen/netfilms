import { MessageCircle, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  return <main className="min-h-screen bg-ink text-white"><div className="container-nf py-12"><a href="/" className="text-sm text-white/50 hover:text-white"><ArrowLeft className="mr-1 inline" size={14}/> Home</a><div className="mt-16 max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Get in touch</p><h1 className="mt-3 text-4xl font-black">Contact NetFilms</h1><p className="mt-4 text-sm leading-7 text-white/55">Questions about the platform, translation credits or authorized content? Contact the NetFilms team.</p><a href="https://wa.me/250794974962" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#25D366] px-5 py-4 font-bold text-black"><MessageCircle/> WhatsApp +250 794 974 962</a></div></div></main>;
}
