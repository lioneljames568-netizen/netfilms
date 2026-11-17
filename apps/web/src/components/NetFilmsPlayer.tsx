"use client";

import { useCallback, useRef } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";

const HISTORY_KEY = "netfilms:watch-history:v1";

export function NetFilmsPlayer({ src, title, contentId }: { src: string; title: string; contentId: string }) {
  const lastSavedAt = useRef(0);
  const saveProgress = useCallback((currentTime: number, duration: number) => {
    if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) return;
    const now = Date.now();
    if (now - lastSavedAt.current < 8000 && currentTime < duration - 5) return;
    lastSavedAt.current = now;
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}") as Record<string, unknown>;
      stored[contentId] = { id: contentId, title, currentTime, duration, updatedAt: now };
      localStorage.setItem(HISTORY_KEY, JSON.stringify(stored));
    } catch { /* Playback must continue if local storage is unavailable. */ }
  }, [contentId, title]);

  const clearProgress = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}") as Record<string, unknown>;
      delete stored[contentId];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(stored));
    } catch { /* Ignore storage failures. */ }
  }, [contentId]);

  return (
    <MediaPlayer title={title} src={src} playsInline aspectRatio="16/9"
      onTimeUpdate={(event) => saveProgress(event.currentTime, event.duration)}
      onEnded={clearProgress}
      className="netfilms-player w-full overflow-hidden rounded-xl border border-white/10 bg-black">
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} colorScheme="dark" />
    </MediaPlayer>
  );
}
