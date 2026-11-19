"use client";

import { useCallback, useRef, type SyntheticEvent, type CSSProperties } from "react";
import { Video, VideoPlayer, VideoSkin } from "@videojs/react/video";

const HISTORY_KEY = "netfilms:watch-history:v1";

type VideoEvent = SyntheticEvent<HTMLVideoElement>;
type CaptionTrack = { src: string; kind?: "subtitles" | "captions"; label: string; language: string; default?: boolean };

export function NetFilmsPlayer({ src, title, contentId, tracks = [] }: { src: string; title: string; contentId: string; tracks?: CaptionTrack[] }) {
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
    } catch {
      // Playback must continue if local storage is unavailable.
    }
  }, [contentId, title]);

  const restoreProgress = useCallback((event: VideoEvent) => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}") as Record<string, { currentTime?: number; duration?: number }>;
      const saved = stored[contentId];
      if (
        saved &&
        typeof saved.currentTime === "number" &&
        saved.currentTime > 0 &&
        saved.currentTime < (saved.duration || Infinity) - 5
      ) {
        event.currentTarget.currentTime = saved.currentTime;
      }
    } catch {
      // Start from the beginning when saved progress is unavailable.
    }
  }, [contentId]);

  const clearProgress = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}") as Record<string, unknown>;
      delete stored[contentId];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(stored));
    } catch {
      // Ignore storage failures.
    }
  }, [contentId]);

  const skinStyle = {
    width: "100%",
    aspectRatio: "16 / 9",
    "--media-accent-color": "#E50914",
    "--media-accent-text-color": "#FFFFFF",
    "--media-border-color": "rgba(255, 255, 255, 0.1)",
    "--media-border-radius": "0.75rem",
    "--media-controls-before-start": "visible",
  } as CSSProperties;

  return (
    <VideoPlayer>
      <VideoSkin
        className="netfilms-player w-full overflow-hidden rounded-xl border border-white/10 bg-black"
        style={skinStyle}
      >
        <Video
          src={src}
          playsInline
          crossOrigin="anonymous"
          onLoadedMetadata={restoreProgress}
          onTimeUpdate={(event) => saveProgress(event.currentTarget.currentTime, event.currentTarget.duration)}
          onEnded={clearProgress}
        >
          {tracks.map((track, index) => (
            <track
              key={`${track.language}-${track.label}-${index}`}
              kind={track.kind || "subtitles"}
              src={track.src}
              srcLang={track.language}
              label={track.label}
              default={track.default}
            />
          ))}
        </Video>
      </VideoSkin>
    </VideoPlayer>
  );
}
