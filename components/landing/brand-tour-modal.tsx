"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Film,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  DEFAULT_TOUR,
  formatChapterTime,
  resolveVideoSource,
  type TourChapter,
  type TourVideoConfig,
} from "../../lib/tour";

/* -------------------------------------------------------------------------- */
/*  SDKs de reproductores embebidos (solo en el navegador)                     */
/* -------------------------------------------------------------------------- */

declare global {
  interface Window {
    YT?: any;
    Vimeo?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const DARK_POSTER_SRC = "/images/hero/altar-ritual.jpg";

let youtubeApiPromise: Promise<any> | null = null;
function loadYouTubeApi(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Solo navegador"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Tiempo de espera agotado")), 10000);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("No se pudo cargar YouTube"));
    };
    document.head.appendChild(script);
  });
  return youtubeApiPromise;
}

let vimeoApiPromise: Promise<any> | null = null;
function loadVimeoApi(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Solo navegador"));
  if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo);
  if (vimeoApiPromise) return vimeoApiPromise;
  vimeoApiPromise = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Tiempo de espera agotado")), 10000);
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timeout);
      resolve(window.Vimeo);
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("No se pudo cargar Vimeo"));
    };
    document.head.appendChild(script);
  });
  return vimeoApiPromise;
}

/* -------------------------------------------------------------------------- */
/*  Modal Cinematográfico del Tour de Marca · Tema Papyrus                     */
/* -------------------------------------------------------------------------- */

type BrandTourModalProps = {
  config?: TourVideoConfig;
  onClose: () => void;
};

export function BrandTourModal({ config = DEFAULT_TOUR, onClose }: BrandTourModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [liveConfig, setLiveConfig] = useState<TourVideoConfig>(config);

  const source = useMemo(() => resolveVideoSource(liveConfig.videoUrl), [liveConfig.videoUrl]);
  const chapters = useMemo<TourChapter[]>(
    () => (liveConfig.chapters ?? []).slice().sort((a, b) => a.time - b.time),
    [liveConfig.chapters],
  );

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [booted, setBooted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [synced, setSynced] = useState(true);
  const [ytNative, setYtNative] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytWrapperRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const vimeoRef = useRef<HTMLIFrameElement | null>(null);
  const vimeoPlayerRef = useRef<any>(null);

  const hasVideo = Boolean(liveConfig.videoUrl?.trim()) && !videoError;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tour", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { config?: TourVideoConfig | null } | null) => {
        if (cancelled || !data?.config) return;
        setLiveConfig((prev) => {
          const next = data.config!;
          if (
            prev.videoUrl === next.videoUrl &&
            prev.title === next.title &&
            prev.ctaText === next.ctaText &&
            prev.ctaLink === next.ctaLink &&
            JSON.stringify(prev.chapters) === JSON.stringify(next.chapters)
          ) {
            return prev;
          }
          setVideoError(false);
          setEnded(false);
          setCurrentTime(0);
          setDuration(0);
          setYtNative(false);
          return next;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted || !hasVideo || source.kind !== "file" || !source.src) return;
    const element = videoRef.current;
    if (!element) return;
    setBooted(true);
    element.play().catch(() => setPlaying(false));
  }, [mounted, hasVideo, source.kind, source.src]);

  useEffect(() => {
    if (!mounted || !hasVideo || source.kind !== "youtube" || !source.id || ytNative) return;
    let disposed = false;
    let poll = 0;
    setSynced(true);
    loadYouTubeApi()
      .then((YT: any) => {
        if (disposed || !ytWrapperRef.current) return;
        const mount = document.createElement("div");
        mount.style.width = "100%";
        mount.style.height = "100%";
        ytWrapperRef.current.appendChild(mount);
        const player = new YT.Player(mount, {
          videoId: source.id,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            disablekb: 1,
            autoplay: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (disposed) return;
              ytPlayerRef.current = event.target;
              const total = event.target.getDuration?.();
              if (typeof total === "number" && total > 0) setDuration(total);
              setBooted(true);
              try {
                event.target.playVideo();
              } catch {
                /* Autoplay bloqueado */
              }
              poll = window.setInterval(() => {
                const current = ytPlayerRef.current;
                if (!current?.getCurrentTime) return;
                const time = current.getCurrentTime();
                if (typeof time === "number") setCurrentTime(time);
                const full = current.getDuration?.();
                if (typeof full === "number" && full > 0) setDuration(full);
              }, 250);
            },
            onStateChange: (event: any) => {
              if (disposed) return;
              if (event.data === 1) {
                setPlaying(true);
                setEnded(false);
              } else if (event.data === 2 || event.data === 3) {
                setPlaying(false);
              } else if (event.data === 0) {
                setPlaying(false);
                setEnded(true);
              }
            },
          },
        });
        ytPlayerRef.current = player;
      })
      .catch(() => {
        if (disposed) return;
        setYtNative(true);
        setSynced(false);
        setBooted(true);
      });
    return () => {
      disposed = true;
      window.clearInterval(poll);
      try {
        ytPlayerRef.current?.destroy?.();
      } catch {}
      ytPlayerRef.current = null;
    };
  }, [mounted, hasVideo, source.kind, source.id, ytNative]);

  useEffect(() => {
    if (!mounted || !hasVideo || source.kind !== "vimeo" || !source.embedUrl) return;
    let disposed = false;
    setSynced(true);
    loadVimeoApi()
      .then((Vimeo: any) => {
        if (disposed || !vimeoRef.current) return;
        const player = new Vimeo.Player(vimeoRef.current);
        vimeoPlayerRef.current = player;
        player.on("loaded", () => {
          if (!disposed) {
            setBooted(true);
            player.getDuration?.().then((total: number) => {
              if (!disposed && typeof total === "number") setDuration(total);
            });
          }
        });
        player.on("timeupdate", (data: { seconds?: number; duration?: number }) => {
          if (disposed) return;
          if (typeof data?.seconds === "number") setCurrentTime(data.seconds);
          if (typeof data?.duration === "number" && data.duration > 0) setDuration(data.duration);
        });
        player.on("play", () => {
          if (!disposed) {
            setPlaying(true);
            setEnded(false);
            setBooted(true);
          }
        });
        player.on("pause", () => {
          if (!disposed) setPlaying(false);
        });
        player.on("ended", () => {
          if (!disposed) {
            setPlaying(false);
            setEnded(true);
          }
        });
      })
      .catch(() => {
        if (disposed) return;
        setSynced(false);
        setBooted(true);
      });
    return () => {
      disposed = true;
      try {
        vimeoPlayerRef.current?.unload?.();
      } catch {}
      vimeoPlayerRef.current = null;
    };
  }, [mounted, hasVideo, source.kind, source.embedUrl]);

  const togglePlay = useCallback(() => {
    if (!hasVideo) return;
    setEnded(false);
    if (source.kind === "file") {
      const element = videoRef.current;
      if (!element) return;
      if (element.paused) element.play().catch(() => setPlaying(false));
      else element.pause();
      return;
    }
    if (source.kind === "youtube") {
      const player = ytPlayerRef.current;
      if (!player) return;
      if (playing) player.pauseVideo?.();
      else player.playVideo?.();
      return;
    }
    const player = vimeoPlayerRef.current;
    if (!player) return;
    if (playing) player.pause?.();
    else player.play?.();
  }, [hasVideo, source.kind, playing]);

  const seek = useCallback(
    (time: number) => {
      if (!hasVideo) return;
      const clamped = Math.max(0, duration > 0 ? Math.min(time, duration) : time);
      setCurrentTime(clamped);
      setEnded(false);
      if (source.kind === "file") {
        const element = videoRef.current;
        if (element) element.currentTime = clamped;
        return;
      }
      if (source.kind === "youtube") {
        ytPlayerRef.current?.seekTo?.(clamped, true);
        return;
      }
      vimeoPlayerRef.current?.setCurrentTime?.(clamped);
    },
    [hasVideo, source.kind, duration],
  );

  const toggleMute = useCallback(() => {
    if (!hasVideo) return;
    if (source.kind === "file") {
      const element = videoRef.current;
      if (!element) return;
      element.muted = !element.muted;
      setMuted(element.muted);
      return;
    }
    if (source.kind === "youtube") {
      const player = ytPlayerRef.current;
      if (!player) return;
      if (muted) player.unMute?.();
      else player.mute?.();
      setMuted(!muted);
      return;
    }
    const player = vimeoPlayerRef.current;
    if (!player) return;
    if (muted) player.setVolume?.(1);
    else player.setVolume?.(0);
    setMuted(!muted);
  }, [hasVideo, source.kind, muted]);

  const replay = useCallback(() => {
    if (!hasVideo) return;
    setEnded(false);
    setCurrentTime(0);
    if (source.kind === "file") {
      const element = videoRef.current;
      if (element) {
        element.currentTime = 0;
        element.play().catch(() => setPlaying(false));
      }
      return;
    }
    if (source.kind === "youtube") {
      const player = ytPlayerRef.current;
      player?.seekTo?.(0, true);
      player?.playVideo?.();
      return;
    }
    const player = vimeoPlayerRef.current;
    player?.setCurrentTime?.(0);
    player?.play?.();
  }, [hasVideo, source.kind]);

  const handleExploreCollection = useCallback(() => {
    const rawLink = (liveConfig.ctaLink || "/tienda").trim();
    onClose();

    if (rawLink.startsWith("#")) {
      window.setTimeout(() => {
        const target = document.querySelector(rawLink);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          router.push("/tienda");
        }
      }, 120);
      return;
    }

    if (rawLink.startsWith("/")) {
      router.push(rawLink);
      return;
    }

    if (/^https?:\/\//i.test(rawLink)) {
      window.location.href = rawLink;
      return;
    }

    router.push("/tienda");
  }, [liveConfig.ctaLink, onClose, router]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (!hasVideo) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (event.key === " " && tag !== "BUTTON" && tag !== "A") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        seek(currentTime + 5);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        seek(currentTime - 5);
      } else if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, hasVideo, togglePlay, seek, toggleMute, currentTime]);

  const activeChapter = useMemo(() => {
    let current: TourChapter | null = null;
    for (const chapter of chapters) {
      if (currentTime >= chapter.time) current = chapter;
      else break;
    }
    return current;
  }, [chapters, currentTime]);

  const activeChapterEnd = useMemo(() => {
    if (!activeChapter) return null;
    const index = chapters.indexOf(activeChapter);
    const next = chapters[index + 1];
    return next ? next.time : null;
  }, [chapters, activeChapter]);

  const chapterVisible =
    hasVideo &&
    synced &&
    !ended &&
    activeChapter !== null &&
    (activeChapterEnd === null || currentTime < activeChapterEnd);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const showStartButton = hasVideo && !playing && !ended && currentTime < 0.25 && booted;

  const onSeekClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    seek(((event.clientX - rect.left) / rect.width) * duration);
  };

  if (!mounted) return null;

  const tourTitle = liveConfig.title?.trim() || "Quiénes Somos";
  const ctaLabel = liveConfig.ctaText?.trim() || "Explorar la Colección";

  const modal = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[#2E231D]/65 p-3 backdrop-blur-xl sm:p-5 md:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Marco editorial Papyrus (#FCFAF5) al 90% de pantalla, con tipografía oscura de alto contraste */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-tour-title"
        className="tour-modal-in relative flex h-[90dvh] max-h-[860px] w-full max-w-[1160px] flex-col justify-between overflow-hidden rounded-3xl border border-[#C5A059]/50 bg-[#FCFAF5] px-5 py-4 text-[#1A1A1A] shadow-[0_36px_110px_-24px_rgba(92,72,48,0.45)] sm:px-8 sm:py-5 md:px-10 md:py-6"
      >
        {/* Atmósfera ambiental dorada sobre Papiro */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -top-36 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.18),transparent_68%)] blur-3xl" />
          <span className="absolute -bottom-32 -right-24 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.12),transparent_70%)] blur-3xl" />
          <span className="absolute inset-2.5 rounded-[1.25rem] border border-[#C5A059]/25" />
        </div>

        {/* Barra superior: distintivo editorial + botón de cierre */}
        <header className="relative z-20 flex shrink-0 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="hidden h-px w-8 bg-gradient-to-r from-[#C5A059] to-transparent sm:block"
            />
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.34em] text-[#8B6914]">
              <Sparkles size={12} aria-hidden="true" />
              Dharma Kadabra · Tour de Marca
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar el tour"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#2C2C2C]/25 bg-[#F4EFE6] text-[#1A1A1A] transition duration-300 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E7B2F] sm:size-11"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        {/* Escenario central: reproductor 16:9 */}
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-3 sm:py-4">
          <div
            className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#C5A059]/50 bg-[#EDE5D7] shadow-[0_24px_65px_-24px_rgba(92,72,48,0.3)]"
            style={{
              maxWidth: "min(920px, max(240px, calc((min(90dvh, 860px) - 14.5rem) * 16 / 9)))",
            }}
          >
            {/* Estado elegante cuando aún no hay video configurado (sobre papiro, texto oscuro) */}
            {!hasVideo ? (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15"
                  style={{ backgroundImage: `url(${DARK_POSTER_SRC})` }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#F4EFE6] via-[#F4EFE6]/85 to-[#FCFAF5]/80"
                />
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
                  <div className="grid size-14 place-items-center rounded-full border border-[#C5A059]/60 bg-[#FCFAF5] text-[#9E7B2F] shadow-[0_8px_24px_-8px_rgba(92,72,48,0.2)]">
                    <Film size={24} strokeWidth={1.4} />
                  </div>
                  <p
                    className="mt-5 text-2xl font-normal tracking-[0.01em] text-[#1A1A1A] sm:text-3xl"
                    style={{ fontFamily: "var(--font-cormorant-garamond), Georgia, serif" }}
                  >
                    El tour estará disponible pronto
                  </p>
                  <p className="mt-2.5 max-w-md text-xs leading-6 text-[#2C2C2C]/80 sm:text-sm">
                    Estamos preparando una experiencia audiovisual inmersiva para compartir nuestra
                    historia contigo.
                  </p>
                </div>
              </>
            ) : (
              <>
                {source.kind === "file" && (
                  <video
                    key={source.src}
                    ref={videoRef}
                    src={source.src}
                    poster={DARK_POSTER_SRC}
                    playsInline
                    preload="metadata"
                    className="relative z-10 h-full w-full bg-[#1A1A1A] object-contain"
                    onClick={togglePlay}
                    onLoadedMetadata={(event) => {
                      setDuration(event.currentTarget.duration || 0);
                      setBooted(true);
                    }}
                    onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                    onPlay={() => {
                      setPlaying(true);
                      setEnded(false);
                    }}
                    onPause={() => setPlaying(false)}
                    onEnded={() => {
                      setPlaying(false);
                      setEnded(true);
                    }}
                    onError={() => {
                      setVideoError(true);
                      setPlaying(false);
                    }}
                  />
                )}

                {source.kind === "youtube" &&
                  (ytNative ? (
                    <iframe
                      key="yt-native"
                      src={`${source.embedUrl}&controls=1&autoplay=1`}
                      title={tourTitle}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 z-10 h-full w-full border-0"
                    />
                  ) : (
                    <div
                      ref={ytWrapperRef}
                      className="absolute inset-0 z-10 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
                    />
                  ))}

                {source.kind === "vimeo" && (
                  <iframe
                    ref={vimeoRef}
                    src={`${source.embedUrl}&autoplay=1`}
                    title={tourTitle}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 z-10 h-full w-full border-0"
                  />
                )}

                {/* Capítulos superpuestos sobre el video (con pastilla cálida de alto contraste) */}
                {chapterVisible && activeChapter && (
                  <div
                    key={`${activeChapter.time}-${activeChapter.label}`}
                    className="tour-chapter-in pointer-events-none absolute bottom-16 left-4 z-20 max-w-md rounded-xl border border-[#C5A059]/45 bg-[#FCFAF5]/92 px-4 py-3 text-[#1A1A1A] shadow-[0_12px_30px_-12px_rgba(46,35,29,0.35)] backdrop-blur-md sm:bottom-20 sm:left-7"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-px w-7 bg-gradient-to-r from-[#C5A059] to-transparent"
                      />
                      <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#8B6914]">
                        {formatChapterTime(activeChapter.time)} · Capítulo
                      </p>
                    </div>
                    <p
                      className="mt-1 text-xl leading-tight text-[#1A1A1A] sm:text-2xl"
                      style={{
                        fontFamily: "var(--font-cormorant-garamond), Georgia, serif",
                      }}
                    >
                      {activeChapter.label}
                    </p>
                    {activeChapter.text && (
                      <p className="mt-1 hidden max-w-sm text-xs leading-5 text-[#2C2C2C]/80 sm:block">
                        {activeChapter.text}
                      </p>
                    )}
                  </div>
                )}

                {/* Botón dorado central para iniciar la reproducción */}
                {showStartButton && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label="Reproducir el tour"
                    className="absolute inset-0 z-20 grid place-items-center bg-[#2E231D]/30 transition hover:bg-[#2E231D]/15"
                  >
                    <span className="grid size-16 place-items-center rounded-full border border-[#FCFAF5]/60 bg-[#C5A059] text-[#1A1A1A] shadow-[0_18px_50px_-12px_rgba(92,72,48,0.55)] transition duration-300 hover:scale-105 hover:bg-[#b58e45]">
                      <Play size={22} fill="currentColor" className="translate-x-0.5" />
                    </span>
                  </button>
                )}

                {/* Barra de controles personalizada sobre banda papiro translúcida */}
                {source.kind !== "vimeo" && !ytNative && (
                  <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[#C5A059]/30 bg-[#FCFAF5]/92 px-4 pb-3 pt-3 text-[#1A1A1A] backdrop-blur-md sm:px-5">
                    <div
                      className="group relative h-1.5 cursor-pointer rounded-full bg-[#2C2C2C]/15"
                      onClick={onSeekClick}
                      role="presentation"
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-[#C5A059]"
                        style={{ width: `${progress}%` }}
                      />
                      {chapters.map((chapter) => (
                        <span
                          key={chapter.time}
                          title={chapter.label}
                          className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-[#8B6914]"
                          style={{
                            left: `${duration > 0 ? Math.min(100, (chapter.time / duration) * 100) : 0}%`,
                          }}
                        />
                      ))}
                    </div>

                    <div className="mt-2.5 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={playing ? "Pausar" : "Reproducir"}
                        className="grid size-8 place-items-center rounded-full border border-[#C5A059]/60 bg-[#F4EFE6] text-[#1A1A1A] transition hover:bg-[#C5A059]"
                      >
                        {playing ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
                      </button>
                      <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={muted ? "Activar sonido" : "Silenciar"}
                        className="grid size-8 place-items-center rounded-full text-[#2C2C2C]/80 transition hover:text-[#8B6914]"
                      >
                        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      </button>
                      <p className="text-xs font-medium tabular-nums tracking-wider text-[#2C2C2C]/80">
                        {formatChapterTime(currentTime)}
                        <span className="mx-1.5 text-[#9E7B2F]">/</span>
                        {formatChapterTime(duration)}
                      </p>
                      {activeChapter && (
                        <p className="ml-auto hidden max-w-[45%] truncate text-[10px] font-semibold uppercase tracking-[.24em] text-[#8B6914] sm:block">
                          {activeChapter.label}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cierre editorial al concluir el video */}
                {ended && (
                  <div className="absolute inset-0 z-30 grid place-items-center bg-[#FCFAF5]/95 px-6 text-center backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-semibold uppercase tracking-[.34em] text-[#8B6914]">
                        El viaje continúa
                      </p>
                      <p
                        className="mt-2 text-2xl text-[#1A1A1A] sm:text-3xl"
                        style={{ fontFamily: "var(--font-cormorant-garamond), Georgia, serif" }}
                      >
                        {tourTitle}
                      </p>
                      <button
                        type="button"
                        onClick={replay}
                        className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C5A059] bg-[#F4EFE6] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[.26em] text-[#1A1A1A] transition hover:bg-[#C5A059]"
                      >
                        <RotateCcw size={13} />
                        Volver a ver
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pie editorial bajo el video */}
        <footer className="relative z-20 flex shrink-0 flex-col items-center justify-between gap-3 border-t border-[#C5A059]/30 pt-3.5 text-center sm:flex-row sm:gap-6 sm:pt-4 sm:text-left">
          <div className="min-w-0">
            <h2
              id="brand-tour-title"
              className="truncate text-2xl font-medium leading-tight tracking-[0.015em] text-[#1A1A1A] sm:text-3xl md:text-[2.15rem]"
              style={{ fontFamily: "var(--font-cormorant-garamond), Georgia, serif" }}
            >
              {tourTitle}
            </h2>
            <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[.28em] text-[#8B6914]">
              {activeChapter ? activeChapter.label : "Conecta · Transforma · Armoniza"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExploreCollection}
            className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-[#C5A059] px-7 py-3 text-[10px] font-semibold uppercase tracking-[.28em] text-[#1A1A1A] shadow-[0_14px_34px_-14px_rgba(92,72,48,0.38)] transition duration-300 hover:bg-[#b58e45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9E7B2F] sm:px-8 sm:py-3.5 sm:text-[11px]"
          >
            {ctaLabel}
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </footer>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}

/* -------------------------------------------------------------------------- */
/*  Disparador en el Hero ("QUIÉNES SOMOS")                                    */
/* -------------------------------------------------------------------------- */

export function BrandTourTrigger({ config }: { config: TourVideoConfig }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 rounded-full border border-[#2C2C2C]/35 bg-[#FCFAF5]/85 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.28em] text-[#1A1A1A] shadow-[0_8px_24px_-12px_rgba(92,72,48,0.2)] transition duration-300 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9E7B2F]"
      >
        Quiénes somos
        <Film size={14} className="text-[#9E7B2F] transition duration-300 group-hover:scale-110 group-hover:text-[#1A1A1A]" aria-hidden="true" />
      </button>
      {open ? <BrandTourModal config={config} onClose={handleClose} /> : null}
    </>
  );
}
