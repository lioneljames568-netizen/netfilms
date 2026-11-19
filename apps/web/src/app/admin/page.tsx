"use client";

import { FormEvent, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type AdminProfile = { user_id: string; display_name: string; role: string; is_active: boolean };
type Translator = { id: string; full_name: string; slug: string };
type MovieOption = { id: string; title: string; status: string };
type SeriesOption = { id: string; title: string; status: string };
type SeasonOption = { id: string; series_id: string; season_number: number; title: string | null };
type EpisodeOption = { id: string; season_id: string; episode_number: number; title: string };

export default function AdminPage() {
  const supabase = getBrowserSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [movieOptions, setMovieOptions] = useState<MovieOption[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<SeriesOption[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<SeasonOption[]>([]);
  const [episodeOptions, setEpisodeOptions] = useState<EpisodeOption[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState("");
  const [episodeMediaKind, setEpisodeMediaKind] = useState<"video" | "episode_thumbnail" | "subtitle">("video");
  const [episodeMediaUrl, setEpisodeMediaUrl] = useState("");
  const [subtitleLabel, setSubtitleLabel] = useState("Kinyarwanda");
  const [subtitleLanguage, setSubtitleLanguage] = useState("rw");
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesSlug, setSeriesSlug] = useState("");
  const [seriesDescription, setSeriesDescription] = useState("");
  const [seriesRightsHolder, setSeriesRightsHolder] = useState("");
  const [seriesRightsReference, setSeriesRightsReference] = useState("");
  const [seriesRightsVerified, setSeriesRightsVerified] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState("1");
  const [seasonTitle, setSeasonTitle] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("1");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeDescription, setEpisodeDescription] = useState("");
  const [episodeTranslatorId, setEpisodeTranslatorId] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [mediaKind, setMediaKind] = useState<"video" | "poster" | "backdrop">("poster");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadNotice, setUploadNotice] = useState("");
  const [externalMediaUrl, setExternalMediaUrl] = useState("");
  const [externalMediaKind, setExternalMediaKind] = useState<"video" | "poster" | "backdrop">("poster");
  const [counts, setCounts] = useState({ movies: 0, translators: 0, series: 0, drafts: 0 });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [rightsHolder, setRightsHolder] = useState("");
  const [rightsReference, setRightsReference] = useState("");
  const [rightsVerified, setRightsVerified] = useState(false);
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
    const [movieCount, translatorCount, seriesCount, draftCount, translatorRows, movieRows, seriesRows, seasonRows, episodeRows] = await Promise.all([
      supabase.from("movies").select("id", { count: "exact", head: true }),
      supabase.from("translators").select("id", { count: "exact", head: true }),
      supabase.from("series").select("id", { count: "exact", head: true }),
      supabase.from("movies").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("translators").select("id,full_name,slug").eq("is_active", true).order("full_name"),
      supabase.from("movies").select("id,title,status").order("created_at", { ascending: false }),
      supabase.from("series").select("id,title,status").order("created_at", { ascending: false }),
      supabase.from("seasons").select("id,series_id,season_number,title").order("season_number"),
      supabase.from("episodes").select("id,season_id,episode_number,title").order("episode_number"),
    ]);
    setCounts({ movies: movieCount.count ?? 0, translators: translatorCount.count ?? 0, series: seriesCount.count ?? 0, drafts: draftCount.count ?? 0 });
    setTranslators(translatorRows.data ?? []);
    setMovieOptions(movieRows.data ?? []);
    setSeriesOptions(seriesRows.data ?? []);
    setSeasonOptions(seasonRows.data ?? []);
    setEpisodeOptions(episodeRows.data ?? []);
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
    if (rightsVerified && (!rightsHolder.trim() || !rightsReference.trim())) { setNotice("Enter the rights holder and authorization reference before confirming rights."); return; }
    setBusy(true); setNotice("");
    const cleanSlug = (slug || title).trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("movies").insert({ title: title.trim(), slug: cleanSlug, description: description.trim(), rights_holder: rightsHolder.trim() || null, rights_reference: rightsReference.trim() || null, rights_verified_at: rightsVerified ? new Date().toISOString() : null, status: "draft", kind: "standalone" }).select("id").single();
    if (error || !data) { setNotice(error?.message ?? "Could not create movie."); setBusy(false); return; }
    const link = await supabase.from("movie_translators").insert({ movie_id: data.id, translator_id: translatorId, credit_order: 1 });
    if (link.error) {
      await supabase.from("movies").delete().eq("id", data.id);
      setNotice("Movie could not be linked to its translator: " + link.error.message);
    } else {
      setCounts(current => ({ ...current, movies: current.movies + 1, drafts: current.drafts + 1 }));
      setTitle(""); setSlug(""); setDescription(""); setRightsHolder(""); setRightsReference(""); setRightsVerified(false);
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


  async function addMediaByUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !selectedMovieId) { setUploadNotice("Choose a movie first."); return; }
    let parsed: URL;
    try { parsed = new URL(externalMediaUrl.trim()); } catch { setUploadNotice("Enter a valid media URL."); return; }
    if (parsed.protocol !== "https:") { setUploadNotice("Media URLs must use HTTPS."); return; }
    setBusy(true); setUploadNotice("Saving external media reference…");
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) { setUploadNotice("Your session expired. Sign in again."); setBusy(false); return; }
    const { data: asset, error } = await supabase.from("media_assets").insert({
      kind: externalMediaKind,
      external_url: parsed.toString(),
      created_by: userData.user.id,
    }).select("id").single();
    if (error || !asset) { setUploadNotice(error?.message ?? "Could not save media URL."); setBusy(false); return; }
    const link = await supabase.from("movie_media").insert({
      movie_id: selectedMovieId,
      media_asset_id: asset.id,
      kind: externalMediaKind,
    });
    if (link.error) {
      await supabase.from("media_assets").delete().eq("id", asset.id);
      setUploadNotice("Could not attach the media URL: " + link.error.message);
    } else {
      setExternalMediaUrl("");
      setUploadNotice("External media URL saved and attached to the selected movie draft.");
    }
    setBusy(false);
  }


  async function createSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !seriesTitle.trim()) return;
    if (seriesRightsVerified && (!seriesRightsHolder.trim() || !seriesRightsReference.trim())) {
      setNotice("Add the series rights holder and authorization reference before confirming rights.");
      return;
    }
    setBusy(true); setNotice("");
    const cleanSlug = (seriesSlug || seriesTitle).trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("series").insert({
      title: seriesTitle.trim(), slug: cleanSlug, description: seriesDescription.trim(),
      rights_holder: seriesRightsHolder.trim() || null,
      rights_reference: seriesRightsReference.trim() || null,
      rights_verified_at: seriesRightsVerified ? new Date().toISOString() : null,
      status: "draft",
    }).select("id,title,status").single();
    if (error || !data) setNotice(error?.message ?? "Could not create series.");
    else {
      setSeriesOptions(current => [data, ...current]);
      setSelectedSeriesId(data.id);
      setCounts(current => ({ ...current, series: current.series + 1 }));
      setSeriesTitle(""); setSeriesSlug(""); setSeriesDescription("");
      setSeriesRightsHolder(""); setSeriesRightsReference(""); setSeriesRightsVerified(false);
      setNotice("Series draft created. Add its seasons and episodes below.");
    }
    setBusy(false);
  }

  async function createSeason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !selectedSeriesId || !Number.isInteger(Number(seasonNumber)) || Number(seasonNumber) < 1) {
      setNotice("Choose a series and enter a valid season number.");
      return;
    }
    setBusy(true); setNotice("");
    const { data, error } = await supabase.from("seasons").insert({
      series_id: selectedSeriesId, season_number: Number(seasonNumber),
      title: seasonTitle.trim() || null, status: "draft",
    }).select("id,series_id,season_number,title").single();
    if (error || !data) setNotice(error?.message ?? "Could not create season.");
    else {
      setSeasonOptions(current => [...current, data].sort((a,b)=>a.season_number-b.season_number));
      setSelectedSeasonId(data.id); setSeasonNumber(String(Number(seasonNumber)+1)); setSeasonTitle("");
      setNotice("Season draft created. Add translated episodes to this season.");
    }
    setBusy(false);
  }

  async function createEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !selectedSeasonId || !episodeTranslatorId || !episodeTitle.trim() ||
        !Number.isInteger(Number(episodeNumber)) || Number(episodeNumber) < 1) {
      setNotice("Choose a season and Kinyarwanda translator, then enter a valid episode number and title.");
      return;
    }
    setBusy(true); setNotice("");
    const { data, error } = await supabase.from("episodes").insert({
      season_id: selectedSeasonId, episode_number: Number(episodeNumber),
      title: episodeTitle.trim(), description: episodeDescription.trim(), status: "draft",
    }).select("id,season_id,episode_number,title").single();
    if (error || !data) { setNotice(error?.message ?? "Could not create episode."); setBusy(false); return; }
    const credit = await supabase.from("episode_translators").insert({
      episode_id: data.id, translator_id: episodeTranslatorId, credit_order: 1,
    });
    if (credit.error) {
      await supabase.from("episodes").delete().eq("id", data.id);
      setNotice("Episode could not be assigned to its translator: " + credit.error.message);
    } else {
      setEpisodeOptions(current => [...current, data].sort((a,b)=>a.episode_number-b.episode_number));
      setSelectedEpisodeId(data.id);
      setEpisodeNumber(String(Number(episodeNumber)+1)); setEpisodeTitle(""); setEpisodeDescription("");
      setNotice("Episode draft created with its translator credit. Add authorized media before publishing.");
    }
    setBusy(false);
  }


  async function uploadEpisodeMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !selectedEpisodeId) { setUploadNotice("Choose an episode first."); return; }
    const form = event.currentTarget;
    const input = form.elements.namedItem("episode-media-file") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) { setUploadNotice("Choose a file to upload."); return; }
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) { setUploadNotice("Your session expired. Sign in again."); return; }
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
    setBusy(true); setUploadProgress(0); setUploadNotice("Preparing secure episode upload…");
    try {
      const intentResponse = await fetch(`${apiBase}/api/v1/admin/media/presign`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filename: file.name, content_type: file.type, kind: episodeMediaKind, byte_size: file.size, ...(episodeMediaKind === "subtitle" ? { subtitle_label: subtitleLabel.trim(), subtitle_language: subtitleLanguage.trim() } : {}) }),
      });
      const intent = await intentResponse.json();
      if (!intentResponse.ok) throw new Error(intent.detail || "Could not prepare upload.");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest(); xhr.open("PUT", intent.upload_url);
        Object.entries(intent.required_headers || {}).forEach(([key, value]) => xhr.setRequestHeader(key, String(value)));
        xhr.upload.onprogress = progress => { if (progress.lengthComputable) setUploadProgress(Math.round(progress.loaded / progress.total * 100)); };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Cloudflare R2 rejected the upload."));
        xhr.onerror = () => reject(new Error("Network error while uploading to Cloudflare R2."));
        xhr.send(file);
      });
      const completeResponse = await fetch(`${apiBase}/api/v1/admin/media/complete`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ object_key: intent.object_key, kind: episodeMediaKind, entity_type: "episode", entity_id: selectedEpisodeId, ...(episodeMediaKind === "subtitle" ? { subtitle_label: subtitleLabel.trim(), subtitle_language: subtitleLanguage.trim() } : {}) }),
      });
      const complete = await completeResponse.json();
      if (!completeResponse.ok) throw new Error(complete.detail || "Could not attach media to the episode.");
      setUploadNotice(`Episode upload complete. ${episodeMediaKind} media has been attached.`);
      setUploadProgress(100); form.reset();
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : "Episode upload failed. Please retry.");
    } finally { setBusy(false); }
  }

  async function addEpisodeMediaByUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !selectedEpisodeId) { setUploadNotice("Choose an episode first."); return; }
    let parsed: URL;
    try { parsed = new URL(episodeMediaUrl.trim()); } catch { setUploadNotice("Enter a valid media URL."); return; }
    if (parsed.protocol !== "https:") { setUploadNotice("Media URLs must use HTTPS."); return; }
    if (episodeMediaKind === "subtitle" && !parsed.pathname.toLowerCase().endsWith(".vtt")) { setUploadNotice("Video.js captions must be WebVTT files with a .vtt extension."); return; }
    if (episodeMediaKind === "subtitle" && (!subtitleLabel.trim() || !/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(subtitleLanguage.trim()))) { setUploadNotice("Enter a subtitle label and valid language code, such as Kinyarwanda and rw."); return; }
    setBusy(true); setUploadNotice("Saving episode media URL…");
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) { setUploadNotice("Your session expired. Sign in again."); setBusy(false); return; }
    const { data: asset, error } = await supabase.from("media_assets").insert({
      kind: episodeMediaKind, external_url: parsed.toString(), created_by: userData.user.id,
      subtitle_label: episodeMediaKind === "subtitle" ? subtitleLabel.trim() : null,
      subtitle_language: episodeMediaKind === "subtitle" ? subtitleLanguage.trim().toLowerCase() : null,
    }).select("id").single();
    if (error || !asset) { setUploadNotice(error?.message ?? "Could not save media URL."); setBusy(false); return; }
    const link = await supabase.from("episode_media").insert({
      episode_id: selectedEpisodeId, media_asset_id: asset.id, kind: episodeMediaKind,
    });
    if (link.error) {
      await supabase.from("media_assets").delete().eq("id", asset.id);
      setUploadNotice("Could not attach episode media: " + link.error.message);
    } else {
      setEpisodeMediaUrl(""); setUploadNotice("Episode media URL saved and attached.");
    }
    setBusy(false);
  }

  if (loading) return <main className="min-h-screen bg-ink p-8 text-white"><p className="text-sm text-white/50">Checking administrator access…</p></main>;

  return <main className="min-h-screen bg-ink text-white">
    <header className="border-b border-white/10 bg-black"><div className="container-nf flex h-16 items-center justify-between"><a href="/" className="text-xl font-black">NET<span className="text-brand">FILMS</span> <span className="ml-2 text-xs font-medium text-white/40">ADMIN</span></a>{profile ? <button onClick={signOut} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold">Sign out</button> : <a href="/" className="text-sm text-white/50">Back to site</a>}</div></header>
    <section className="container-nf py-12">
      {!profile ? <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-panel p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Private workspace</p><h1 className="mt-3 text-3xl font-black">Administrator sign in</h1><p className="mt-3 text-sm leading-6 text-white/50">Sign in with an account that has already been assigned a NetFilms admin role. Public registration is disabled.</p><form onSubmit={signIn} className="mt-7 space-y-4"><label className="block text-xs font-semibold text-white/65">Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="block text-xs font-semibold text-white/65">Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><button disabled={busy || !supabase} className="w-full rounded-lg bg-brand py-3 text-sm font-bold disabled:opacity-40">{busy ? "Signing in…" : "Sign in securely"}</button></form>{notice && <p role="status" className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-5 text-white/65">{notice}</p>}</div> :
      <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Content control center</p><h1 className="mt-2 text-4xl font-black">Welcome, {profile.display_name}</h1><p className="mt-2 text-sm text-white/50">Signed in as {profile.role.replace("_"," ")}.</p></div><span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Verified admin session</span></div>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Movies",counts.movies],["Draft movies",counts.drafts],["Translators",counts.translators],["Series",counts.series]].map(([label,value])=><div key={label} className="rounded-xl border border-white/10 bg-panel p-5"><p className="text-xs text-white/45">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2"><form onSubmit={createTranslator} className="rounded-2xl border border-white/10 bg-panel p-6"><h2 className="text-xl font-black">Add translator</h2><p className="mt-2 text-xs leading-5 text-white/45">Create a contributor profile. Their assigned titles will appear automatically.</p><label className="mt-5 block text-xs font-semibold text-white/65">Full name<input required value={newTranslator} onChange={e=>setNewTranslator(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">Biography<textarea value={newTranslatorBio} onChange={e=>setNewTranslatorBio(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-white/10 bg-black p-3 text-sm outline-none focus:border-brand"/></label><button disabled={busy} className="mt-5 rounded-lg border border-white/15 px-5 py-3 text-xs font-bold disabled:opacity-40">Create translator</button></form>
      <form onSubmit={createMovie} className="rounded-2xl border border-white/10 bg-panel p-6"><h2 className="text-xl font-black">Create movie draft</h2><p className="mt-2 text-xs leading-5 text-white/45">A translator is required. Drafts remain private until media and distribution rights are verified.</p><label className="mt-5 block text-xs font-semibold text-white/65">Movie title<input required value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">URL slug (optional)<input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="generated-from-title" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">Description<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-white/10 bg-black p-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">Rights holder<input value={rightsHolder} onChange={e=>setRightsHolder(e.target.value)} placeholder="Copyright owner or distributor" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 block text-xs font-semibold text-white/65">Authorization reference<input value={rightsReference} onChange={e=>setRightsReference(e.target.value)} placeholder="License / permission reference" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="mt-4 flex items-start gap-3 text-xs leading-5 text-white/65"><input type="checkbox" checked={rightsVerified} onChange={e=>setRightsVerified(e.target.checked)} className="mt-1 accent-red-600"/>I have checked the authorization and confirm NetFilms has permission to distribute this title.</label><label className="mt-4 block text-xs font-semibold text-white/65">Kinyarwanda translator<select required value={translatorId} onChange={e=>setTranslatorId(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose translator</option>{translators.map(person=><option key={person.id} value={person.id}>{person.full_name}</option>)}</select></label><button disabled={busy || !translators.length} className="mt-5 rounded-lg bg-brand px-5 py-3 text-xs font-bold disabled:opacity-40">Create draft</button></form></div>
      <form onSubmit={addMediaByUrl} className="mt-6 rounded-2xl border border-white/10 bg-panel p-6"><h2 className="text-xl font-black">Add media by URL</h2><p className="mt-2 text-xs leading-5 text-white/45">Use an HTTPS URL for a media asset hosted by a provider you are authorized to use.</p><div className="mt-5 grid gap-4 md:grid-cols-[1fr_220px]"><label className="block text-xs font-semibold text-white/65">HTTPS media URL<input type="url" required value={externalMediaUrl} onChange={e=>setExternalMediaUrl(e.target.value)} placeholder="https://media.example.com/asset.mp4" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="block text-xs font-semibold text-white/65">Media type<select value={externalMediaKind} onChange={e=>setExternalMediaKind(e.target.value as "video" | "poster" | "backdrop")} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="poster">Poster image</option><option value="backdrop">Backdrop image</option><option value="video">Movie video</option></select></label></div><button disabled={busy || !selectedMovieId} className="mt-5 rounded-lg border border-white/15 px-5 py-3 text-xs font-bold disabled:opacity-40">Save URL reference</button></form>
      <form onSubmit={uploadMedia} className="mt-6 rounded-2xl border border-white/10 bg-panel p-6"><h2 className="text-xl font-black">Upload movie media to Cloudflare R2</h2><p className="mt-2 text-xs leading-5 text-white/45">Files upload directly from your browser to R2 using a short-lived signed URL. R2 credentials never reach the browser.</p><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="block text-xs font-semibold text-white/65">Movie<select required value={selectedMovieId} onChange={e=>setSelectedMovieId(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose movie</option>{movieOptions.map(movie=><option key={movie.id} value={movie.id}>{movie.title} ({movie.status})</option>)}</select></label><label className="block text-xs font-semibold text-white/65">Media type<select value={mediaKind} onChange={e=>setMediaKind(e.target.value as "video" | "poster" | "backdrop")} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="poster">Poster image</option><option value="backdrop">Backdrop image</option><option value="video">Movie video</option></select></label><label className="block text-xs font-semibold text-white/65">Choose file<input name="media-file" required type="file" accept={mediaKind==="video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp"} className="mt-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"/></label></div><div className="mt-5 flex flex-wrap items-center gap-4"><button disabled={busy || !movieOptions.length} className="rounded-lg bg-brand px-5 py-3 text-xs font-bold disabled:opacity-40">{busy ? "Uploading…" : "Upload and attach media"}</button>{uploadProgress > 0 && <span className="text-xs tabular-nums text-white/60">{uploadProgress}%</span>}</div>{uploadProgress > 0 && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-brand transition-all" style={{width:`${uploadProgress}%`}}/></div>}{uploadNotice && <p role="status" className="mt-4 text-xs leading-5 text-white/60">{uploadNotice}</p>}</form>
      <section className="mt-10">
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Episodic content</p><h2 className="mt-2 text-2xl font-black">Build a series, season and episodes</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Create the series structure in order. Every episode must have a Kinyarwanda translator credit. New content stays in draft until rights and media checks are complete.</p></div>
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={createSeries} className="rounded-2xl border border-white/10 bg-panel p-6">
            <h3 className="text-lg font-black">1. Create series draft</h3>
            <label className="mt-4 block text-xs font-semibold text-white/65">Series title<input required value={seriesTitle} onChange={e=>setSeriesTitle(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label>
            <label className="mt-3 block text-xs font-semibold text-white/65">URL slug (optional)<input value={seriesSlug} onChange={e=>setSeriesSlug(e.target.value)} placeholder="generated-from-title" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label>
            <label className="mt-3 block text-xs font-semibold text-white/65">Description<textarea rows={3} value={seriesDescription} onChange={e=>setSeriesDescription(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black p-3 text-sm outline-none focus:border-brand"/></label>
            <label className="mt-3 block text-xs font-semibold text-white/65">Rights holder<input value={seriesRightsHolder} onChange={e=>setSeriesRightsHolder(e.target.value)} placeholder="Copyright owner or distributor" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label>
            <label className="mt-3 block text-xs font-semibold text-white/65">Authorization reference<input value={seriesRightsReference} onChange={e=>setSeriesRightsReference(e.target.value)} placeholder="License / permission reference" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label>
            <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-white/65"><input type="checkbox" checked={seriesRightsVerified} onChange={e=>setSeriesRightsVerified(e.target.checked)} className="mt-1 accent-red-600"/>I have checked and confirmed distribution authorization for this series.</label>
            <button disabled={busy} className="mt-5 rounded-lg bg-brand px-5 py-3 text-xs font-bold disabled:opacity-40">Create series draft</button>
          </form>
          <div className="space-y-6">
            <form onSubmit={createSeason} className="rounded-2xl border border-white/10 bg-panel p-6">
              <h3 className="text-lg font-black">2. Add a season</h3>
              <label className="mt-4 block text-xs font-semibold text-white/65">Series<select required value={selectedSeriesId} onChange={e=>{setSelectedSeriesId(e.target.value);setSelectedSeasonId("");}} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose series</option>{seriesOptions.map(item=><option key={item.id} value={item.id}>{item.title} ({item.status})</option>)}</select></label>
              <div className="mt-3 grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-white/65">Season number<input required type="number" min="1" step="1" value={seasonNumber} onChange={e=>setSeasonNumber(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="block text-xs font-semibold text-white/65">Season name (optional)<input value={seasonTitle} onChange={e=>setSeasonTitle(e.target.value)} placeholder="e.g. The beginning" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label></div>
              <button disabled={busy || !selectedSeriesId} className="mt-5 rounded-lg border border-white/15 px-5 py-3 text-xs font-bold disabled:opacity-40">Add season draft</button>
            </form>
            <form onSubmit={createEpisode} className="rounded-2xl border border-white/10 bg-panel p-6">
              <h3 className="text-lg font-black">3. Add translated episode</h3>
              <label className="mt-4 block text-xs font-semibold text-white/65">Season<select required value={selectedSeasonId} onChange={e=>setSelectedSeasonId(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose season</option>{seasonOptions.filter(item=>item.series_id===selectedSeriesId).map(item=><option key={item.id} value={item.id}>Season {item.season_number}{item.title ? ` — ${item.title}` : ""}</option>)}</select></label>
              <div className="mt-3 grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-white/65">Episode number<input required type="number" min="1" step="1" value={episodeNumber} onChange={e=>setEpisodeNumber(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="block text-xs font-semibold text-white/65">Kinyarwanda translator<select required value={episodeTranslatorId} onChange={e=>setEpisodeTranslatorId(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose translator</option>{translators.map(person=><option key={person.id} value={person.id}>{person.full_name}</option>)}</select></label></div>
              <label className="mt-3 block text-xs font-semibold text-white/65">Episode title<input required value={episodeTitle} onChange={e=>setEpisodeTitle(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label>
              <label className="mt-3 block text-xs font-semibold text-white/65">Description<textarea rows={2} value={episodeDescription} onChange={e=>setEpisodeDescription(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black p-3 text-sm outline-none focus:border-brand"/></label>
              <button disabled={busy || !selectedSeasonId || !translators.length} className="mt-5 rounded-lg bg-brand px-5 py-3 text-xs font-bold disabled:opacity-40">Create episode draft</button>
            </form>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={addEpisodeMediaByUrl} className="rounded-2xl border border-white/10 bg-panel p-6">
          <h3 className="text-lg font-black">Episode media by HTTPS URL</h3>
          <p className="mt-2 text-xs leading-5 text-white/45">Attach an authorized video, thumbnail or WebVTT subtitle URL to an episode.</p>
          <label className="mt-4 block text-xs font-semibold text-white/65">Episode<select required value={selectedEpisodeId} onChange={e=>setSelectedEpisodeId(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose episode</option>{episodeOptions.map(item=><option key={item.id} value={item.id}>Episode {item.episode_number}: {item.title}</option>)}</select></label>
          <label className="mt-3 block text-xs font-semibold text-white/65">Media URL<input required type="url" value={episodeMediaUrl} onChange={e=>setEpisodeMediaUrl(e.target.value)} placeholder="https://…" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label>
          <label className="mt-3 block text-xs font-semibold text-white/65">Media type<select value={episodeMediaKind} onChange={e=>setEpisodeMediaKind(e.target.value as "video" | "episode_thumbnail" | "subtitle")} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="video">Episode video</option><option value="episode_thumbnail">Episode thumbnail</option><option value="subtitle">WebVTT subtitles (.vtt)</option></select></label>
          {episodeMediaKind === "subtitle" && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold text-white/65">Subtitle label<input required maxLength={80} value={subtitleLabel} onChange={e=>setSubtitleLabel(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="block text-xs font-semibold text-white/65">Language code<input required maxLength={35} value={subtitleLanguage} onChange={e=>setSubtitleLanguage(e.target.value)} placeholder="rw" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label></div>}
          <button disabled={busy || !selectedEpisodeId} className="mt-5 rounded-lg border border-white/15 px-5 py-3 text-xs font-bold disabled:opacity-40">Attach episode URL</button>
        </form>
        <form onSubmit={uploadEpisodeMedia} className="rounded-2xl border border-white/10 bg-panel p-6">
          <h3 className="text-lg font-black">Upload episode media to R2</h3>
          <p className="mt-2 text-xs leading-5 text-white/45">Direct browser-to-R2 upload with a short-lived signed URL and server-side verification. Subtitle uploads must be WebVTT (.vtt).</p>
          <label className="mt-4 block text-xs font-semibold text-white/65">Episode<select required value={selectedEpisodeId} onChange={e=>setSelectedEpisodeId(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="">Choose episode</option>{episodeOptions.map(item=><option key={item.id} value={item.id}>Episode {item.episode_number}: {item.title}</option>)}</select></label>
          <label className="mt-3 block text-xs font-semibold text-white/65">Media type<select value={episodeMediaKind} onChange={e=>setEpisodeMediaKind(e.target.value as "video" | "episode_thumbnail" | "subtitle")} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"><option value="video">Episode video</option><option value="episode_thumbnail">Episode thumbnail</option><option value="subtitle">WebVTT subtitles (.vtt)</option></select></label>
          {episodeMediaKind === "subtitle" && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold text-white/65">Subtitle label<input required maxLength={80} value={subtitleLabel} onChange={e=>setSubtitleLabel(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label><label className="block text-xs font-semibold text-white/65">Language code<input required maxLength={35} value={subtitleLanguage} onChange={e=>setSubtitleLanguage(e.target.value)} placeholder="rw" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm outline-none focus:border-brand"/></label></div>}
          <label className="mt-3 block text-xs font-semibold text-white/65">Choose file<input name="episode-media-file" required type="file" accept={episodeMediaKind==="video" ? "video/mp4,video/webm,video/quicktime" : episodeMediaKind==="subtitle" ? ".vtt,text/vtt" : "image/jpeg,image/png,image/webp"} className="mt-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"/></label>
          <button disabled={busy || !selectedEpisodeId} className="mt-5 rounded-lg bg-brand px-5 py-3 text-xs font-bold disabled:opacity-40">{busy ? "Uploading…" : "Upload and attach episode media"}</button>
        </form>
      </div>
      {notice && <p role="status" className="mt-6 rounded-lg border border-white/10 bg-panel p-4 text-sm text-white/70">{notice}</p>}
      <p className="mt-8 text-xs leading-6 text-white/35">Publishing remains intentionally disabled until the complete review and launch configuration is ready.</p></>}
    </section>
  </main>;
}
