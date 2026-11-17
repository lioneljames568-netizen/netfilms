"use client";

import { FormEvent, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type AdminProfile = { user_id: string; display_name: string; role: string; is_active: boolean };
type Translator = { id: string; full_name: string; slug: string };
type MovieOption = { id: string; title: string; status: string };

export default function AdminPage() {
  const supabase = getBrowserSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [movieOptions, setMovieOptions] = useState<MovieOption[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [mediaKind, setMediaKind] = useState<"video" | "poster" | "backdrop">("poster");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadNotice, setUploadNotice] = useState("");
  const [counts, setCounts] = useState({ movies: 0, translators: 0, series: 0, drafts: 0 });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [translatorId, setTranslatorId] = useState("");
  const [newTranslator, setNewTranslator] = useState("");
  const [newTranslatorBio, setNewTranslatorBio] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadAdmin() {
    if (!supabase) { setNotice("Add the Supabase URL and publishable key to apps/web/.env.local to enable admin sign-in."); setLoading(false); return; }
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data, error } = await supabase.from("admin_users").select("user_id,display_name,role,is_active").eq("user_id", user.id).maybeSingle();
    if (error || !data || !data.is_active) { setProfile(null); setNotice("This account is not assigned an active NetFilms administrator role."); setLoading(false); return; }
    setProfile(data);
    const [movieCount, translatorCount, seriesCount, draftCount, translatorRows, movieRows] = await Promise.all([
      supabase.from("movies").select("id", { count: "exact", head: true }),
      supabase.from("translators").select("id", { count: "exact", head: true }),
      supabase.from("series").select("id", { count: "exact", head: true }),
      supabase.from("movies").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("translators").select("id,full_name,slug").eq("is_active", true).order("full_name"),
      supabase.from("movies").select("id,title,status").order("created_at", { ascending: false }),
    ]);
    setCounts({ movies: movieCount.count ?? 0, translators: translatorCount.count ?? 0, series: seriesCount.count ?? 0, drafts: draftCount.count ?? 0 });
    setTranslators(translatorRows.data ?? []);
    setMovieOptions(movieRows.data ?? []);
    setLoading(false);
  }

  useEffect(() => { void loadAdmin(); }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setNotice(error.message);
    else await loadAdmin();
    setBusy(false);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setProfile(null);
    setNotice("You have signed out.");
  }

  async function createTranslator(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !newTranslator.trim()) return;
    setBusy(true); setNotice("");
    const baseSlug = newTranslator.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("translators").insert({ full_name: newTranslator.trim(), slug: baseSlug, biography: newTranslatorBio.trim(), is_active: true }).select("id,full_name,slug").single();
    if (error) setNotice(error.message);
    else { setTranslators(current => [...current, data].sort((a,b)=>a.full_name.localeCompare(b.full_name))); setTranslatorId(data.id); setNewTranslator(""); setNewTranslatorBio(""); setNotice("Translator profile created."); }
    setBusy(false);
  }

  async function createMovie(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !title.trim() || !translatorId) { setNotice("Enter a movie title and choose a translator."); return; }
    setBusy(true); setNotice("");
    const cleanSlug = (slug || title).trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("movies").insert({ title: title.trim(), slug: cleanSlug, description: description.trim(), status: "draft", kind: "standalone" }).select("id").single();
    if (error || !data) { setNotice(error?.message ?? "Could not create movie."); setBusy(false); return; }
    const link = await supabase.from("movie_translators").insert({ movie_id: data.id, translator_id: translatorId, credit_order: 1 });
    if (link.error) {
      await supabase.from("movies").delete().eq("id", data.id);
      setNotice("Movie could not be linked to its translator: " + link.error.message);
    } else {
      setCounts(current => ({ ...current, movies: current.movies + 1, drafts: current.drafts + 1 }));
      setTitle(""); setSlug(""); setDescription("");
      setNotice("Draft created with its translator credit. Add authorized media and rights verification before publishing.");
    }
    setBusy(false);
  }


  async function uploadMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !selectedMovieId) { setUploadNotice("Choose a movie first."); return; }
    const form = event.currentTarget;
    const input = form.elements.namedItem("media-file") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) { setUploadNotice("Choose a file to upload."); return; }
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) { setUploadNotice("Your session expired. Sign in again."); return; }
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
    setBusy(true); setUploadProgress(0); setUploadNotice("Preparing secure upload…");
    try {
      const intentResponse = await fetch(`${apiBase}/api/v1/admin/media/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filename: file.name, content_type: file.type, kind: mediaKind, byte_size: file.size }),
      });
      const intent = await intentResponse.json();
      if (!intentResponse.ok) throw new Error(intent.detail || "Could not prepare upload.");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", intent.upload_url);
        Object.entries(intent.required_headers || {}).forEach(([key, value]) => xhr.setRequestHeader(key, String(value)));
        xhr.upload.onprogress = (progress) => { if (progress.lengthComputable) setUploadProgress(Math.round(progress.loaded / progress.total * 100)); };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Cloudflare R2 rejected the upload."));
        xhr.onerror = () => reject(new Error("Network error while uploading to Cloudflare R2."));
        xhr.send(file);
      });
      setUploadNotice("Verifying upload and saving media record…");
      const completeResponse = await fetch(`${apiBase}/api/v1/admin/media/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ object_key: intent.object_key, kind: mediaKind, entity_type: "movie", entity_id: selectedMovieId }),
      });
      const complete = await completeResponse.json();
      if (!completeResponse.ok) throw new Error(complete.detail || "Could not attach media to the movie.");
      setUploadNotice(`Upload complete. ${mediaKind} media has been attached to the selected draft.`);
      setUploadProgress(100);
      form.reset();
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : "Upload failed. Please retry.");
    } finally { setBusy(false); }
  }

  if (loading) return <main className="min-h-screen bg-ink p-8 text-white"><p className="text-sm text-white/50">Checking administrator access…</p></main>;

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span> <span className="ml-2 text-xs font-medium text-white/40">ADMIN</span></a>{profile ? <button onClick={signOut} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold">Sign out</button> : <a href="/" className="text-sm text-white/50">Back to site</a>}</div></header>
    <section className="container-nf py-12">
      {!profile ? <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-panel p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Private workspace</p><h1 className="mt-3 text-3xl font-black">Administrator sign in</h1><p className="mt-3 text-sm leading-6 text-white/50">Sign in with an account that has already been assigned a NetFilms admin role. Public registration is disabled.</p><form onSubmit={signIn} className="mt-7 space-y-4"><label className="block text-xs font-semibold text-white/65">Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="block text-xs font-semibold text-white/65">Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><button disabled={busy || !supabase} className="w-full rounded-lg bg-brand py-3 text-sm font-bold disabled:opacity-40">{busy ? "Signing in…" : "Sign in securely"}</button></form>{notice && <p role="status" className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-5 text-white/65">{notice}</p>}</div> :
      <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Content control center</p><h1 className="mt-2 text-4xl font-black">Welcome, {profile.display_name}</h1><p className="mt-2 text-sm text-white/50">Signed in as {profile.role.replace("_"," ")}.</p></div><span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Verified admin session</span></div>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Movies",counts.movies],["Draft movies",counts.drafts],["Translators",counts.translators],["Series",counts.series]].map(([label,value])=><div key={label} className="rounded-xl border border-white/10 bg-panel p-5"><p className="text-xs text-white/45">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2"><form onSubmit={createTranslator} className="rounded-2xl border border-white/10 bg-panel p-6"><h2 className="text-xl font-black">Add translator</h2><p className="mt-2 text-xs leading-5 text-white/45">Create a contributor profile. Their assigned titles will appear automatically.</p><label className="mt-5 block text-xs font-semibold text-white/65">Full name<input required value={newTranslator} onChange={e=>setNewTranslator(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">Biography<textarea value={newTranslatorBio} onChange={e=>setNewTranslatorBio(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-white/10 bg-black p-3 text-sm outline-none focus:border-brand"/></label><button disabled={busy} className="mt-5 rounded-lg border border-white/15 px-5 py-3 text-xs font-bold disabled:opacity-40">Create translator</button></form>
      <form onSubmit={createMovie} className="rounded-2xl border border-white/10 bg-panel p-6"><h2 className="text-xl font-black">Create movie draft</h2><p className="mt-2 text-xs leading-5 text-white/45">A translator is required. Drafts remain private until media and distribution rights are verified.</p><label className="mt-5 block text-xs font-semibold text-white/65">Movie title<input required value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">URL slug (optional)<input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="generated-from-title" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">Description<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-white/10 bg-black p-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">Kinyarwanda translator<select required value={translatorId} onChange={e=>setTranslatorId(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose translator</option>{translators.map(person=><option key={person.id} value={person.id}>{person.full_name}</option>)}</select></label><button disabled={busy || !translators.length} className="mt-5 rounded-lg bg-brand px-5 py-3 text-xs font-bold disabled:opacity-40">Create draft</button></form></div>
      <form onSubmit={uploadMedia} className="mt-6 rounded-2xl border border-white/10 bg-panel p-6"><h2 className="text-xl font-black">Upload movie media to Cloudflare R2</h2><p className="mt-2 text-xs leading-5 text-white/45">Files upload directly from your browser to R2 using a short-lived signed URL. R2 credentials never reach the browser.</p><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="block text-xs font-semibold text-white/65">Movie<select required value={selectedMovieId} onChange={e=>setSelectedMovieId(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose movie</option>{movieOptions.map(movie=><option key={movie.id} value={movie.id}>{movie.title} ({movie.status})</option>)}</select></label><label className="block text-xs font-semibold text-white/65">Media type<select value={mediaKind} onChange={e=>setMediaKind(e.target.value as "video" | "poster" | "backdrop")} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="poster">Poster image</option><option value="backdrop">Backdrop image</option><option value="video">Movie video</option></select></label><label className="block text-xs font-semibold text-white/65">Choose file<input name="media-file" required type="file" accept={mediaKind==="video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp"} className="mt-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"/></label></div><div className="mt-5 flex flex-wrap items-center gap-4"><button disabled={busy || !movieOptions.length} className="rounded-lg bg-brand px-5 py-3 text-xs font-bold disabled:opacity-40">{busy ? "Uploading…" : "Upload and attach media"}</button>{uploadProgress > 0 && <span className="text-xs tabular-nums text-white/60">{uploadProgress}%</span>}</div>{uploadProgress > 0 && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-brand transition-all" style={{width:`${uploadProgress}%`}}/></div>}{uploadNotice && <p role="status" className="mt-4 text-xs leading-5 text-white/60">{uploadNotice}</p>}</form>
      {notice && <p role="status" className="mt-6 rounded-lg border border-white/10 bg-panel p-4 text-sm text-white/70">{notice}</p>}
      <p className="mt-8 text-xs leading-6 text-white/35">Publishing is intentionally not available in this first admin phase. The next phase adds rights verification, secure Cloudflare R2 uploads, and guarded publishing.</p></>}
    </section>
  </main>;
}
