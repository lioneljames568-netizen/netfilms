"use client";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";

export function NetFilmsPlayer({ src, title }: { src: string; title: string }) {
  return (
    <MediaPlayer
      title={title}
      src={src}
      playsInline
      aspectRatio="16/9"
      className="netfilms-player w-full overflow-hidden rounded-xl border border-white/10 bg-black"
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} colorScheme="dark" />
    </MediaPlayer>
  );
}
