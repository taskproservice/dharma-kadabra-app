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
/*  Modal Cinematográfico del Tour de Marca                                    */
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

  /* ---------- Portal seguro en cliente ---------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------- Sincronización viva con la API de Prisma (/api/tour) ---------- */
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
      .catch(() => {
        /* Se conserva la configuración inicial (SSR o respaldo) sin interrumpir. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Reproductor HTML5 (MP4 / WebM / OGG / MOV) ---------- */
  useEffect(() => {
    if (!mounted || !hasVideo || source.kind !== "file" || !source.src) return;
    const element = videoRef.current;
    if (!element) return;
    setBooted(true);
    element.play().catch(() => setPlaying(false));
  }, [mounted, hasVideo, source.kind, source.src]);

  /* ---------- YouTube (IFrame API + degradación nativa) ---------- */
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
                /* Autoplay bloqueado: queda el botón dorado central */
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
      } catch {
        /* noop */
      }
      ytPlayerRef.current = null;
    };
  }, [mounted, hasVideo, source.kind, source.id, ytNative]);

  /* ---------- Vimeo (iframe dorado + Player SDK) ---------- */
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
      } catch {
        /* noop */
      }
      vimeoPlayerRef.current = null;
    };
  }, [mounted, hasVideo, source.kind, source.embedUrl]);

  /* ---------- Controles compartidos ---------- */
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

  /* ---------- CTA: cerrar el modal y llevar hacia la tienda ---------- */
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

  /* ---------- Bloquear scroll del documento + atajos de teclado ---------- */
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

  /* ---------- Capítulo activo por tiempo ---------- */
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
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-black/95 p-3 backdrop-blur-xl sm:p-5 md:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Marco cinematográfico Nocturno (#121212) al 90% de pantalla, sin scrollbars */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-tour-title"
        className="tour-modal-in relative flex h-[90dvh] max-h-[860px] w-full max-w-[1160px] flex-col justify-between overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-[#121212]/95 px-5 py-4 text-[#F7F3EA] shadow-[0_40px_140px_-20px_rgba(0,0,0,0.95),0_0_80px_-30px_rgba(197,160,89,0.22)] backdrop-blur-2xl sm:px-8 sm:py-5 md:px-10 md:py-6"
      >
        {/* Atmósfera ambiental dorada sobre Nocturno */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -top-36 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.14),transparent_68%)] blur-3xl" />
          <span className="absolute -bottom-32 -right-24 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.08),transparent_70%)] blur-3xl" />
          <span className="absolute inset-2.5 rounded-[1.25rem] border border-[#C5A059]/10" />
        </div>

        {/* Barra superior: distintivo editorial + botón de cierre dorado */}
        <header className="relative z-20 flex shrink-0 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="hidden h-px w-8 bg-gradient-to-r from-[#C5A059] to-transparent sm:block"
            />
            <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.34em] text-[#C5A059]">
              <Sparkles size={12} aria-hidden="true" />
              Dharma Kadabra · Tour de Marca
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar el tour"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#C5A059]/50 bg-[#121212]/80 text-[#C5A059] transition duration-300 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#121212] hover:shadow-[0_0_28px_rgba(197,160,89,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] sm:size-11"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        {/* Escenario central: reproductor 16:9 contenido con exactitud dentro del viewport */}
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-3 sm:py-4">
          <div
            className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#C5A059]/30 bg-[#0A0A0A] shadow-[0_32px_90px_-28px_rgba(0,0,0,0.95),0_0_0_1px_rgba(197,160,89,0.08)]"
            style={{
              maxWidth: "min(920px, max(240px, calc((min(90dvh, 860px) - 14.5rem) * 16 / 9)))",
            }}
          >
            {/* Poster oscuro de fondo mientras carga el reproductor */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
              style={{ backgroundImage: `url(${DARK_POSTER_SRC})` }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/65 to-[#121212]/40"
            />

            {/* Estado elegante cuando aún no hay video configurado */}
            {!hasVideo ? (
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
                <div className="grid size-14 place-items-center rounded-full border border-[#C5A059]/45 bg-[#121212]/80 text-[#C5A059] shadow-[0_0_40px_rgba(197,160,89,0.2)]">
                  <Film size={24} strokeWidth={1.4} />
                </div>
                <p
                  className="mt-5 text-2xl font-normal tracking-[0.01em] text-[#F7F3EA] sm:text-3xl"
                  style={{ fontFamily: "var(--font-cormorant-garamond), Georgia, serif" }}
                >
                  El tour estará disponible pronto
                </p>
                <p className="mt-2.5 max-w-md text-xs leading-6 text-[#F7F3EA]/60 sm:text-sm">
                  Estamos preparando una experiencia audiovisual inmersiva para compartir nuestra
                  historia contigo.
                </p>
              </div>
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
                    className="relative z-10 h-full w-full bg-black object-contain"
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

                {/* Capítulos superpuestos por tiempo */}
                {chapterVisible && activeChapter && (
                  <div
                    key={`${activeChapter.time}-${activeChapter.label}`}
                    className="tour-chapter-in pointer-events-none absolute bottom-16 left-4 z-20 max-w-md sm:bottom-20 sm:left-7"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-px w-7 bg-gradient-to-r from-[#C5A059] to-transparent"
                      />
                      <p className="text-[10px] font-medium uppercase tracking-[.3em] text-[#C5A059]">
                        {formatChapterTime(activeChapter.time)} · Capítulo
                      </p>
                    </div>
                    <p
                      className="mt-1.5 text-xl leading-tight text-[#F7F3EA] sm:text-2xl"
                      style={{
                        fontFamily: "var(--font-cormorant-garamond), Georgia, serif",
                        textShadow: "0 2px 24px rgba(0,0,0,0.85)",
                      }}
                    >
                      {activeChapter.label}
                    </p>
                    {activeChapter.text && (
                      <p
                        className="mt-1 hidden max-w-sm text-xs leading-5 text-[#F7F3EA]/80 sm:block"
                        style={{ textShadow: "0 1px 14px rgba(0,0,0,0.85)" }}
                      >
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
                    className="absolute inset-0 z-20 grid place-items-center bg-[#121212]/35 transition hover:bg-[#121212]/15"
                  >
                    <span className="grid size-16 place-items-center rounded-full border border-[#F7F3EA]/30 bg-[#C5A059] text-[#121212] shadow-[0_18px_50px_-12px_rgba(197,160,89,0.9)] transition duration-300 hover:scale-105 hover:brightness-110">
                      <Play size={22} fill="currentColor" className="translate-x-0.5" />
                    </span>
                  </button>
                )}

                {/* Barra de controles personalizada (HTML5 / YouTube) */}
                {source.kind !== "vimeo" && !ytNative && (
                  <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 pb-3 pt-10 sm:px-5">
                    <div
                      className="group relative h-1.5 cursor-pointer rounded-full bg-[#F7F3EA]/20"
                      onClick={onSeekClick}
                      role="presentation"
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.6)]"
                        style={{ width: `${progress}%` }}
                      />
                      {chapters.map((chapter) => (
                        <span
                          key={chapter.time}
                          title={chapter.label}
                          className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-[#F7F3EA]/70"
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
                        className="grid size-8 place-items-center rounded-full border border-[#C5A059]/45 bg-[#121212]/60 text-[#F7F3EA] transition hover:border-[#C5A059] hover:text-[#C5A059]"
                      >
                        {playing ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
                      </button>
                      <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={muted ? "Activar sonido" : "Silenciar"}
                        className="grid size-8 place-items-center rounded-full text-[#F7F3EA]/75 transition hover:text-[#C5A059]"
                      >
                        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      </button>
                      <p className="text-xs tabular-nums tracking-wider text-[#F7F3EA]/75">
                        {formatChapterTime(currentTime)}
                        <span className="mx-1.5 text-[#C5A059]/50">/</span>
                        {formatChapterTime(duration)}
                      </p>
                      {activeChapter && (
                        <p className="ml-auto hidden max-w-[45%] truncate text-[10px] uppercase tracking-[.24em] text-[#C5A059] sm:block">
                          {activeChapter.label}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cierre cinematográfico al concluir el video */}
                {ended && (
                  <div className="absolute inset-0 z-30 grid place-items-center bg-[#121212]/85 px-6 text-center backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-medium uppercase tracking-[.34em] text-[#C5A059]">
                        El viaje continúa
                      </p>
                      <p
                        className="mt-2 text-2xl text-[#F7F3EA] sm:text-3xl"
                        style={{ fontFamily: "var(--font-cormorant-garamond), Georgia, serif" }}
                      >
                        {tourTitle}
                      </p>
                      <button
                        type="button"
                        onClick={replay}
                        className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C5A059]/50 bg-[#121212]/80 px-5 py-2.5 text-[10px] font-medium uppercase tracking-[.26em] text-[#C5A059] transition hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#121212]"
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

        {/* Pie editorial bajo el video: Título en Cormorant Garamond Oro + CTA */}
        <footer className="relative z-20 flex shrink-0 flex-col items-center justify-between gap-3 border-t border-[#C5A059]/18 pt-3.5 text-center sm:flex-row sm:gap-6 sm:pt-4 sm:text-left">
          <div className="min-w-0">
            <h2
              id="brand-tour-title"
              className="truncate text-2xl font-medium leading-tight tracking-[0.015em] text-[#C5A059] sm:text-3xl md:text-[2.15rem]"
              style={{ fontFamily: "var(--font-cormorant-garamond), Georgia, serif" }}
            >
              {tourTitle}
            </h2>
            <p className="mt-0.5 truncate text-[10px] uppercase tracking-[.28em] text-[#F7F3EA]/55">
              {activeChapter ? activeChapter.label : "Conecta · Transforma · Armoniza"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExploreCollection}
            className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-gradient-to-r from-[#C5A059] via-[#E2C88E] to-[#C5A059] px-7 py-3 text-[10px] font-semibold uppercase tracking-[.28em] text-[#121212] shadow-[0_14px_40px_-14px_rgba(197,160,89,0.85)] transition duration-300 hover:brightness-110 hover:shadow-[0_18px_48px_-12px_rgba(197,160,89,0.95)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059] sm:px-8 sm:py-3.5 sm:text-[11px]"
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

/**
 * Botón del Hero ("QUIÉNES SOMOS"). Al pulsarlo abre el Tour de marca en un
 * modal inmersivo montado en portal sobre `document.body`.
 */
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
        className="group inline-flex items-center gap-3 rounded-full border border-[#C5A059] bg-transparent px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.28em] text-[#F7F3EA] transition duration-300 hover:bg-[#C5A059] hover:text-[#121212] hover:shadow-[0_0_40px_-6px_rgba(197,160,89,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059]"
      >
        Quiénes somos
        <Film size={14} className="transition duration-300 group-hover:scale-110" aria-hidden="true" />
      </button>
      {open ? <BrandTourModal config={config} onClose={handleClose} /> : null}
    </>
  );
}
