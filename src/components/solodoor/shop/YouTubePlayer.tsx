import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** The part of the YouTube player the page uses. */
interface Player {
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  destroy(): void;
}

interface YouTubeApi {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host?: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, number | string>;
      events?: { onReady?: (event: { target: Player }) => void };
    },
  ) => Player;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

/** Loads YouTube's player script once; every later call gets the same promise. */
function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT as YouTubeApi);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

/** iPhones and iPads let only the hardware buttons set the volume; a page cannot. */
const isIos = () => typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

function Speaker({ muted }: { muted: boolean }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
      {muted ? <path d="m16 9.5 5 5m0-5-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6m2.2-8.2a7 7 0 0 1 0 10.4" />}
    </svg>
  );
}

/**
 * A YouTube video with its own volume control under it: a mute button and a slider. The player starts at once
 * (the pop-up that holds it was opened by a tap) and is removed with the pop-up, which stops the video.
 */
export function YouTubePlayer({ id, title, wide, className }: { id: string; title: string; wide?: boolean; className?: string }) {
  const mount = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const ios = isIos();

  useEffect(() => {
    let created: Player | null = null;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !mount.current) return;
      // The API swaps this element for the player's iframe.
      const host = document.createElement("div");
      mount.current.appendChild(host);
      created = new YT.Player(host, {
        videoId: id,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: (event) => {
            setPlayer(event.target);
            setVolume(event.target.getVolume());
            setMuted(event.target.isMuted());
          },
        },
      });
    });
    return () => {
      cancelled = true;
      created?.destroy();
      setPlayer(null);
    };
  }, [id]);

  const change = (next: number) => {
    setVolume(next);
    player?.setVolume(next);
    if (next > 0 && muted) {
      player?.unMute();
      setMuted(false);
    }
  };
  const toggleMute = () => {
    if (!player) return;
    if (muted || volume === 0) {
      player.unMute();
      if (volume === 0) change(60);
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  };

  const silent = muted || volume === 0;
  return (
    <div className={cn("flex min-h-0 flex-col items-center gap-3", className)}>
      <div
        ref={mount}
        role="group"
        aria-label={title}
        className={cn(
          "relative flex-none overflow-hidden rounded-lg bg-foreground [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full [&_iframe]:border-0",
          wide ? "aspect-video w-full" : "aspect-[9/16] h-[min(40rem,calc(100dvh-14rem))] max-w-full",
        )}
      />
      <div className="flex w-full max-w-[22rem] items-center gap-3 rounded-full bg-muted py-1.5 ps-1.5 pe-5">
        <button
          type="button"
          onClick={toggleMute}
          disabled={!player}
          aria-label={silent ? "הפעלת קול" : "השתקה"}
          aria-pressed={silent}
          className="flex size-[44px] flex-none cursor-pointer items-center justify-center rounded-full bg-background text-foreground disabled:cursor-default disabled:opacity-40"
        >
          <Speaker muted={silent} />
        </button>
        {ios ? (
          <span className="fs-14 leading-[1.4] text-foreground">את עוצמת הקול מכוונים בכפתורי המכשיר</span>
        ) : (
          <input
            type="range"
            dir="ltr"
            min={0}
            max={100}
            step={1}
            value={muted ? 0 : volume}
            disabled={!player}
            onChange={(e) => change(Number(e.target.value))}
            aria-label="עוצמת קול"
            className="h-11 min-w-0 flex-auto cursor-pointer accent-[var(--color-clay)] disabled:cursor-default disabled:opacity-40"
          />
        )}
      </div>
    </div>
  );
}
