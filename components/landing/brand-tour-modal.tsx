"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ArrowRight, Film, Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import {
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
/*  Modal del Tour                                                             */
/* -------------------------------------------------------------------------- */

type BrandTourModalProps = {
  config: TourVideoConfig;
  onClose: () => void;
};

export function BrandTourModal({ config, onClose }: BrandTourModalProps) {
  const source = useMemo(() => resolveVideoSource(config.videoUrl), [config.videoUrl]);
  const chapters = useMemo<TourChapter[]>(
    () => config.chapters.slice().sort((a, b) => a.time - b.time),
    [config.chapters],
  );

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [booted, setBooted] = useState(false);
  /** Los capítulos se sincronizan por tiempo solo cuando el reproductor lo permite. */
  const [synced, setSynced] = useState(true);
  /** YouTube sin SDK: se degrada a un iframe con controles nativos. */
  const [ytNative, setYtNative] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytWrapperRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const vimeoRef = useRef<HTMLIFrameElement | null>(null);
  const vimeoPlayerRef = useRef<any>(null);

  /* ---------- Reproductor HTML5 (MP4/WebM/…) ---------- */
  useEffect(() => {
    if (source.kind !== "file") return;
    const element = videoRef.current;
    if (!element) return;
    // El gesto de clic del usuario en "Quiénes somos" acompaña a este play;
    // si el navegador lo bloquea, queda el botón dorado central.
    element.play().catch(() => setPlaying(false));
  }, [source.kind, source.src]);

  /* ---------- YouTube (iframe limpio + API oficial para sincronizar) ---------- */
  useEffect(() => {
    if (source.kind !== "youtube" || !source.id || ytNative) return;
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
                /* autoplay bloqueado: botón central */
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
        // Sin SDK el iframe sigue siendo reproducible con controles nativos.
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
  }, [source.kind, source.id, ytNative]);

  /* ---------- Vimeo (iframe estilizado + Player SDK para sincronizar) ---------- */
  useEffect(() => {
    if (source.kind !== "vimeo" || !source.embedUrl) return;
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
        // Degradado: el iframe con controles nativos de Vimeo (oro de marca) funciona;
        // los capítulos se muestran como ruta y el CTA queda siempre disponible.
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
  }, [source.kind, source.embedUrl]);

  /* ---------- Controles compartidos ---------- */
  const togglePlay = useCallback(() => {
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
  }, [source.kind, playing]);

  const seek = useCallback(
    (time: number) => {
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
    [source.kind, duration],
  );

  const toggleMute = useCallback(() => {
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
  }, [source.kind, muted]);

  const replay = useCallback(() => {
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
  }, [source.kind]);

  /* ---------- CTA final: cerrar el modal y desplazarse a la colección ---------- */
  const handleCta = useCallback(() => {
    const link = (config.ctaLink || "#coleccion").trim();
    onClose();
    if (link.startsWith("#")) {
      window.setTimeout(() => {
        document.querySelector(link)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 160);
    } else if (link) {
      window.location.href = link;
    }
  }, [config.ctaLink, onClose]);

  /* ---------- Cerrar con Escape · bloquear scroll del fondo ---------- */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === " ") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        seek(currentTime + 5);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        seek(currentTime - 5);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, togglePlay, seek, currentTime]);

  /* ---------- Capítulo activo (por tiempo) ---------- */
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
    synced && !ended && activeChapter !== null &&
    (activeChapterEnd === null || currentTime < activeChapterEnd);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const showStartButton = !playing && !ended && currentTime < 0.25 && booted;

  const onSeekClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    seek(((event.clientX - rect.left) / rect.width) * duration);
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#121212]"
      role="dialog"
      aria-modal="true"
      aria-label={config.title}
    >
      {/* Atmósfera Nordic Mystic: oro tenue y brasa de fuego */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.14),transparent_65%)] blur-3xl" />
        <span className="absolute bottom-[-12rem] right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(217,101,56,.10),transparent_70%)] blur-3xl" />
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar el tour"
        className="absolute right-4 top-4 z-40 grid size-11 place-items-center rounded-full border border-[#C5A059]/35 bg-[#121212]/70 text-[#F7F3EA]/80 transition hover:border-[#C5A059] hover:text-[#C5A059] hover:shadow-[0_0_24px_rgba(197,160,89,.35)] sm:right-6 sm:top-6"
      >
        <X size={18} />
      </button>

      <div className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 pr-14">
          <p className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[.32em] text-[#C5A059]">
            <Film size={13} />
            Tour de marca
          </p>
          <span aria-hidden="true" className="hidden h-px w-12 bg-gradient-to-r from-[#C5A059]/70 to-transparent sm:block" />
          <h2 className="font-display text-2xl leading-tight text-[#F7F3EA] sm:text-3xl">{config.title}</h2>
        </header>

        <div className="flex flex-1 items-center justify-center py-6 sm:py-8">
          <div className="w-full max-w-4xl">
            {/* Reproductor */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#C5A059]/25 bg-black shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)]">
              {source.kind === "file" && (
                <video
                  ref={videoRef}
                  src={source.src}
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-contain"
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
                />
              )}

              {source.kind === "youtube" && (
                ytNative ? (
                  <iframe
                    key="yt-native"
                    src={`${source.embedUrl}&controls=1&autoplay=1`}
                    title={config.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <div ref={ytWrapperRef} className="absolute inset-0 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0" />
                )
              )}

              {source.kind === "vimeo" && (
                <iframe
                  ref={vimeoRef}
                  src={`${source.embedUrl}&autoplay=1`}
                  title={config.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}

              {!source.src && source.kind === "file" && (
                <div className="absolute inset-0 grid place-items-center px-8 text-center">
                  <p className="max-w-sm text-sm leading-6 text-[#F7F3EA]/60">
                    Aún no hay un video configurado para el tour. Súbelo o pega su URL desde el
                    panel <span className="text-[#C5A059]">Tour de marca</span> del Dashboard.
                  </p>
                </div>
              )}

              {/* Capítulos superpuestos por tiempo */}
              {chapterVisible && activeChapter && (
                <div
                  key={`${activeChapter.time}-${activeChapter.label}`}
                  className="tour-chapter-in pointer-events-none absolute bottom-20 left-4 z-10 max-w-md sm:bottom-24 sm:left-8"
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-[#C5A059] to-transparent" />
                    <p className="text-[10px] font-medium uppercase tracking-[.32em] text-[#C5A059]">
                      {formatChapterTime(activeChapter.time)} · Capítulo
                    </p>
                  </div>
                  <p
                    className="mt-2 font-display text-2xl leading-tight text-[#F7F3EA] sm:text-3xl"
                    style={{ textShadow: "0 2px 28px rgba(0,0,0,.75)" }}
                  >
                    {activeChapter.label}
                  </p>
                  {activeChapter.text && (
                    <p
                      className="mt-2 max-w-md text-sm leading-6 text-[#F7F3EA]/75"
                      style={{ textShadow: "0 1px 14px rgba(0,0,0,.75)" }}
                    >
                      {activeChapter.text}
                    </p>
                  )}
                </div>
              )}

              {/* Botón dorado central al iniciar */}
              {showStartButton && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Reproducir el tour"
                  className="absolute inset-0 z-20 grid place-items-center bg-[#121212]/30 transition hover:bg-[#121212]/15"
                >
                  <span className="grid size-16 place-items-center rounded-full bg-[#C5A059] text-[#2E231D] shadow-[0_18px_50px_-14px_rgba(197,160,89,.9)] transition hover:scale-105 hover:brightness-110">
                    <Play size={22} fill="currentColor" />
                  </span>
                </button>
              )}

              {/* Barra de controles limpia (HTML5 / YouTube) */}
              {source.kind !== "vimeo" && !ytNative && (
                <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-3 pt-12 sm:px-6">
                  <div
                    className="group relative h-1.5 cursor-pointer rounded-full bg-[#F7F3EA]/15"
                    onClick={onSeekClick}
                    role="presentation"
                  >
                    <div className="absolute inset-y-0 left-0 rounded-full bg-[#C5A059]" style={{ width: `${progress}%` }} />
                    {chapters.map((chapter) => (
                      <span
                        key={chapter.time}
                        title={chapter.label}
                        className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-[#F7F3EA]/60"
                        style={{ left: `${duration > 0 ? Math.min(100, (chapter.time / duration) * 100) : 0}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={playing ? "Pausar" : "Reproducir"}
                      className="grid size-9 place-items-center rounded-full border border-[#C5A059]/45 text-[#F7F3EA] transition hover:border-[#C5A059] hover:text-[#C5A059]"
                    >
                      {playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={muted ? "Activar sonido" : "Silenciar"}
                      className="grid size-9 place-items-center rounded-full text-[#F7F3EA]/75 transition hover:text-[#C5A059]"
                    >
                      {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                    <p className="font-display text-xs tabular-nums text-[#F7F3EA]/80">
                      {formatChapterTime(currentTime)}
                      <span className="mx-1.5 text-[#F7F3EA]/35">/</span>
                      {formatChapterTime(duration)}
                    </p>
                    {activeChapter && (
                      <p className="ml-auto hidden max-w-[45%] truncate text-[10px] uppercase tracking-[.24em] text-[#C5A059]/90 sm:block">
                        {activeChapter.label}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Final del video: CTA dorado */}
              {ended && (
                <div className="absolute inset-0 z-30 grid place-items-center bg-[#121212]/85 px-6 text-center backdrop-blur-sm">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[.32em] text-[#C5A059]">El viaje continúa</p>
                    <button
                      type="button"
                      onClick={handleCta}
                      className="group mt-6 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#C5A059] via-[#D9BE86] to-[#C5A059] px-8 py-4 text-[11px] font-semibold uppercase tracking-[.28em] text-[#2E231D] shadow-[0_18px_50px_-16px_rgba(197,160,89,.85)] transition hover:brightness-110"
                    >
                      {config.ctaText}
                      <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                    </button>
                    <div>
                      <button
                        type="button"
                        onClick={replay}
                        className="mt-5 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.24em] text-[#F7F3EA]/55 transition hover:text-[#C5A059]"
                      >
                        <RotateCcw size={12} />
                        Volver a ver
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modo degradado: ruta de capítulos + CTA siempre disponible */}
            {!synced && chapters.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {chapters.map((chapter) => (
                  <span
                    key={chapter.time}
                    className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/25 px-3.5 py-1.5 text-[10px] uppercase tracking-[.18em] text-[#F7F3EA]/70"
                  >
                    <span className="text-[#C5A059]">{formatChapterTime(chapter.time)}</span>
                    {chapter.label}
                  </span>
                ))}
              </div>
            )}
            {!synced && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={handleCta}
                  className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#C5A059] via-[#D9BE86] to-[#C5A059] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[.28em] text-[#2E231D] shadow-[0_18px_50px_-16px_rgba(197,160,89,.85)] transition hover:brightness-110"
                >
                  {config.ctaText}
                  <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C5A059]/12 pt-4">
          <p className="text-[10px] uppercase tracking-[.22em] text-[#F7F3EA]/35">
            Conecta · Transforma · Armoniza
          </p>
          <p className="text-[10px] uppercase tracking-[.22em] text-[#F7F3EA]/35">
            Esc para cerrar · ← → para avanzar
          </p>
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Disparador en el Hero                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Botón principal del Hero ("Quiénes somos"). Al pulsarlo abre el Tour de
 * marca en una ventana a pantalla completa con fondo Nocturno.
 */
export function BrandTourTrigger({ config }: { config: TourVideoConfig }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 rounded-full border border-[#C5A059] bg-transparent px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.28em] text-[#F7F3EA] transition duration-300 hover:bg-[#C5A059] hover:text-[#2E231D] hover:shadow-[0_0_40px_-6px_rgba(197,160,89,.7)]"
      >
        Quiénes somos
        <Film size={14} className="transition group-hover:scale-110" />
      </button>
      {open ? <BrandTourModal config={config} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
