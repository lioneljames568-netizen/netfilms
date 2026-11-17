"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

const STORAGE_KEY = "netfilms:watchlist:v1";

export function AddToMyListButton({ movieId }: { movieId: string }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setSaved(Array.isArray(ids) && ids.includes(movieId));
    } catch {
      setSaved(false);
    } finally {
      setReady(true);
    }
  }, [movieId]);

  function toggleSaved() {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const ids = Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
      const next = saved ? ids.filter((id) => id !== movieId) : [...new Set([...ids, movieId])];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(!saved);
    } catch {
      // Keep the control usable without crashing the movie details page.
    }
  }

  return (
    <button type="button" onClick={toggleSaved} disabled={!ready}
      aria-pressed={saved}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[.06] px-5 py-3 text-sm font-bold transition hover:border-brand/60 hover:bg-white/10 disabled:opacity-50">
      {saved ? <BookmarkCheck size={18} className="text-brand" /> : <Bookmark size={18} />}
      {saved ? "Saved to My List" : "Add to My List"}
    </button>
  );
}
