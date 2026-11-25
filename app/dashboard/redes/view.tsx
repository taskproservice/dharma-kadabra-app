"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Facebook,
  Flame,
  Globe,
  Heart,
  ImageIcon,
  Instagram,
  MessageCircle,
  Plus,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

interface ScheduledPost {
  id: string;
  content: string;
  platforms: ("instagram" | "facebook")[];
  date: string;
  time: string;
  status: "SCHEDULED" | "PUBLISHED";
  image?: string;
}

const INITIAL_POSTS: ScheduledPost[] = [
  {
    id: "post-1",
    content:
      "✨ Luna Llena en Tauro: El poder del enraizamiento y la manifestación consciente. Hoy encendemos la llama interior para honrar nuestros procesos y dar la bienvenida a la abundancia genuina. ¿Qué intención siembras hoy en tu altar personal? 🕯️🌿",
    platforms: ["instagram", "facebook"],
    date: "2026-11-20",
    time: "18:00",
    status: "SCHEDULED",
    image: "/images/hero/altar-ritual.jpg",
  },
  {
    id: "post-2",
    content:
      "Descubre la sabiduría de las Runas Nórdicas. Fehu simboliza la riqueza espiritual y el flujo de energía creadora. Recuerda que la verdadera magia ocurre cuando tus pensamientos y tus acciones caminan al unísono. 🔮✨",
    platforms: ["instagram"],
    date: "2026-11-22",
    time: "11:30",
    status: "SCHEDULED",
    image: "/images/productos/set-runas.jpg",
  },
  {
    id: "post-3",
    content:
      "Abrimos nuevas fechas para lecturas de Registros Akáshicos con Paola Hernández. Conecta con las memorias de tu alma y comprende las lecciones de tu momento presente. Cupos limitados para diciembre. 🕊️💫",
    platforms: ["facebook", "instagram"],
    date: "2026-11-25",
    time: "19:00",
    status: "SCHEDULED",
    image: "/images/equipo/paola-hernandez.jpg",
  },
];

const QUICK_HASHTAGS = [
  "#DharmaKadabra",
  "#SabiduriaAncestral",
  "#RegistrosAkashicos",
  "#RunasNordicas",
  "#PazInterior",
  "#RitualSagrado",
  "#EnergiaConsciente",
];

const PRESET_IMAGES = [
  { label: "Altar Ritual", path: "/images/hero/altar-ritual.jpg" },
  { label: "Joyería Sagrada", path: "/images/hero/joyeria-sagrada.jpg" },
  { label: "Set de Runas", path: "/images/productos/set-runas.jpg" },
  { label: "Vela Intención", path: "/images/productos/vela-intencion.jpg" },
  { label: "Talismán Solar", path: "/images/productos/talisman-solar.jpg" },
];

export default function RedesPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_POSTS);
  const [content, setContent] = useState("");
  const [targetInstagram, setTargetInstagram] = useState(true);
  const [targetFacebook, setTargetFacebook] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("2026-11-21");
  const [scheduleTime, setScheduleTime] = useState("18:00");
  const [selectedImage, setSelectedImage] = useState<string>("/images/hero/joyeria-sagrada.jpg");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<"instagram" | "facebook">("instagram");

  const handleAddHashtag = (tag: string) => {
    setContent((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleSchedulePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const platforms: ("instagram" | "facebook")[] = [];
    if (targetInstagram) platforms.push("instagram");
    if (targetFacebook) platforms.push("facebook");

    if (platforms.length === 0) {
      setFormError("Por favor selecciona al menos una plataforma (Instagram o Facebook).");
      return;
    }
    setFormError(null);

    const newPost: ScheduledPost = {
      id: `post-${Date.now()}`,
      content: content.trim(),
      platforms,
      date: scheduleDate,
      time: scheduleTime,
      status: "SCHEDULED",
      image: selectedImage || undefined,
    };

    setPosts([newPost, ...posts]);
    setContent("");
    setSuccessBanner(
      `¡Publicación programada exitosamente para el ${scheduleDate} a las ${scheduleTime} hrs en ${platforms.join(" y ")}!`
    );

    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Encabezado editorial */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d8bc7f]">
            <Share2 size={15} />
            <span>Difusión & Comunidad Sagrada</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#e9e2d2] md:text-4xl">
            Redes Sociales
          </h1>
          <p className="mt-1.5 text-sm text-[#e9e2d2]/55">
            Métricas de audiencia y estudio de programación unificada para Instagram y Facebook.
          </p>
        </div>

        {/* Estado de conexión simulada */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-[#c7a45a]/20 bg-white/[0.04] px-3.5 py-2 shadow-sm backdrop-blur-md">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            <Instagram size={16} className="text-[#E1306C]" />
            <span className="text-xs font-medium text-[#e9e2d2]">@dharmakadabra</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Conectado
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[#c7a45a]/20 bg-white/[0.04] px-3.5 py-2 shadow-sm backdrop-blur-md">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            <Facebook size={16} className="text-[#1877F2]" />
            <span className="text-xs font-medium text-[#e9e2d2]">Dharma Kadabra</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Conectado
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas Glassmorphism de Métricas de Ejemplo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Métrica 1: Seguidores Totales */}
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/55">
              Seguidores Totales
            </CardDescription>
            <span className="grid size-9 place-items-center rounded-xl bg-[#c7a45a]/12 text-[#d8bc7f]">
              <Users size={18} />
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-semibold text-[#e9e2d2]">48,620</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-300">
                +14.2%
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#c7a45a]/14 pt-2 text-[11px] text-[#e9e2d2]/55">
              <span>IG: 34.2K</span>
              <span>•</span>
              <span>FB: 14.4K</span>
              <span>•</span>
              <span className="text-emerald-300">+1.2k este mes</span>
            </div>
          </CardContent>
        </Card>

        {/* Métrica 2: Alcance Mensual */}
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/55">
              Alcance Mensual
            </CardDescription>
            <span className="grid size-9 place-items-center rounded-xl bg-[#c7a45a]/12 text-[#d8bc7f]">
              <TrendingUp size={18} />
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-semibold text-[#e9e2d2]">182.4K</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-300">
                +28.5%
              </span>
            </div>
            <p className="mt-3 border-t border-[#c7a45a]/14 pt-2 text-[11px] text-[#e9e2d2]/55">
              Cuentas alcanzadas en últimos 30 días
            </p>
          </CardContent>
        </Card>

        {/* Métrica 3: Impresiones & Visualizaciones */}
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/55">
              Impresiones
            </CardDescription>
            <span className="grid size-9 place-items-center rounded-xl bg-[#c7a45a]/12 text-[#d8bc7f]">
              <Eye size={18} />
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-semibold text-[#e9e2d2]">495.2K</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-300">
                +32.1%
              </span>
            </div>
            <p className="mt-3 border-t border-[#c7a45a]/14 pt-2 text-[11px] text-[#e9e2d2]/55">
              Reels, publicaciones y rituales en vivo
            </p>
          </CardContent>
        </Card>

        {/* Métrica 4: Tasa de Interacción (Engagement) */}
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#e9e2d2]/55">
              Engagement
            </CardDescription>
            <span className="grid size-9 place-items-center rounded-xl bg-[#c7a45a]/12 text-[#d8bc7f]">
              <Heart size={18} />
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-semibold text-[#e9e2d2]">6.8%</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-300">
                +2.4 pts
              </span>
            </div>
            <p className="mt-3 border-t border-[#c7a45a]/14 pt-2 text-[11px] text-[#e9e2d2]/55">
              Promedio de interacciones y comentarios
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Banner de Confirmación */}
      {successBanner && (
        <div role="status" className="flex items-center justify-between rounded-2xl border border-emerald-500/35 bg-emerald-500/15 p-4 text-sm text-emerald-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-300" />
            <p className="font-medium">{successBanner}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-300 hover:text-papyrus"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {formError && (
        <div role="alert" className="flex items-center justify-between rounded-2xl border border-red-400/35 bg-red-500/15 p-4 text-sm text-red-200">
          <p>{formError}</p>
          <button type="button" onClick={() => setFormError(null)} className="text-red-300 hover:text-papyrus">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Zona Principal: Formulario de Programación + Previsualización en Vivo */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Formulario de Programación de Publicaciones */}
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles size={20} className="text-[#d8bc7f]" />
                    Programar Publicación
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Redacta el mensaje, selecciona plataformas conectadas y asigna fecha/hora de difusión.
                  </CardDescription>
                </div>
                <span className="rounded-full bg-[#c7a45a]/20 px-3 py-1 text-xs font-medium text-[#d8bc7f]">
                  Studio Social Media
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSchedulePost} className="space-y-5">
                {/* Selector de Canales */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#e9e2d2]/70">
                    Plataformas de destino
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setTargetInstagram(!targetInstagram)}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        targetInstagram
                          ? "border-[#E1306C] bg-[#E1306C]/10 text-[#E1306C]"
                          : "border-[#c7a45a]/18 bg-white/[0.03] text-[#e9e2d2]/55 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Instagram size={17} />
                      Instagram (@dharmakadabra)
                      {targetInstagram && <span className="ml-1 text-xs font-bold">✓</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetFacebook(!targetFacebook)}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        targetFacebook
                          ? "border-[#1877F2] bg-[#1877F2]/10 text-[#1877F2]"
                          : "border-[#c7a45a]/18 bg-white/[0.03] text-[#e9e2d2]/55 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Facebook size={17} />
                      Facebook (Dharma Kadabra)
                      {targetFacebook && <span className="ml-1 text-xs font-bold">✓</span>}
                    </button>
                  </div>
                </div>

                {/* Área de texto para el Copy */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="post-content"
                      className="text-xs font-bold uppercase tracking-wider text-[#e9e2d2]/70"
                    >
                      Texto de la publicación (Copy)
                    </label>
                    <span className="text-xs text-[#e9e2d2]/40">
                      {content.length} caracteres
                    </span>
                  </div>
                  <textarea
                    id="post-content"
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe tu reflexión, anuncio de ritual, lanzamiento de talismanes o sabiduría del día... (ej: 'El despertar de la luna nos recuerda sembrar intenciones claras...')"
                    className="w-full rounded-2xl border border-[#c7a45a]/20 bg-white/[0.05] p-4 text-sm leading-relaxed text-[#e9e2d2] outline-none placeholder:text-[#e9e2d2]/40 focus:border-[#c7a45a] focus:ring-2 focus:ring-[#D4AF37]/25"
                  />
                </div>

                {/* Sugerencias Rápidas de Hashtags Sagrados */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#e9e2d2]/70">
                    Etiquetas sugeridas (Hashtags):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_HASHTAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddHashtag(tag)}
                        className="rounded-full border border-[#c7a45a]/30 bg-[#c7a45a]/10 px-3 py-1 text-xs text-[#d8bc7f] transition hover:bg-[#c7a45a]/20"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector de Imagen / Multimedia */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#e9e2d2]/70">
                    Imagen para la publicación
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.path}
                        type="button"
                        onClick={() => setSelectedImage(img.path)}
                        className={`group relative h-16 cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                          selectedImage === img.path
                            ? "border-gold ring-2 ring-gold/40"
                            : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img.path}
                          alt={img.label}
                          fill
                          sizes="140px"
                          className="object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-obsidian/75 py-0.5 text-center text-[10px] text-papyrus">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fecha y Hora de Programación */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="schedule-date"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e9e2d2]/70"
                    >
                      <Calendar size={14} /> Fecha de publicación
                    </label>
                    <input
                      id="schedule-date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#c7a45a]/20 bg-white/[0.05] px-3 text-sm text-[#e9e2d2] outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#D4AF37]/25"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="schedule-time"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e9e2d2]/70"
                    >
                      <Clock size={14} /> Hora programada
                    </label>
                    <input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#c7a45a]/20 bg-white/[0.05] px-3 text-sm text-[#e9e2d2] outline-none focus:border-[#c7a45a] focus:ring-2 focus:ring-[#D4AF37]/25"
                    />
                  </div>
                </div>

                {/* Botón de Enviar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!content.trim()}
                    className="h-11 gap-2 rounded-xl px-6 font-semibold"
                  >
                    <Send size={16} />
                    Programar Publicación
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Cola de Publicaciones Programadas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#e9e2d2]">
                Cola de Publicaciones Programadas ({posts.length})
              </h2>
              <span className="text-xs text-[#e9e2d2]/55">Sincronización automática activa</span>
            </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#c7a45a]/20 bg-white/[0.04] p-4 shadow-sm backdrop-blur-md transition hover:bg-white/[0.06] sm:flex-row sm:items-start"
                >
                  {post.image && (
                    <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
                      <Image
                        src={post.image}
                        alt="Miniatura"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {post.platforms.map((p) => (
                        <span
                          key={p}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            p === "instagram"
                              ? "bg-[#E1306C]/15 text-[#E1306C]"
                              : "bg-[#1877F2]/15 text-[#1877F2]"
                          }`}
                        >
                          {p === "instagram" ? <Instagram size={11} /> : <Facebook size={11} />}
                          {p}
                        </span>
                      ))}

                      <span className="inline-flex items-center gap-1 text-[11px] text-[#e9e2d2]/55">
                        <Calendar size={12} /> {post.date} a las {post.time} hrs
                      </span>

                      <span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        En cola
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#e9e2d2]">
                      {post.content}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    aria-label="Cancelar publicación programada"
                    className="self-start rounded-lg p-1.5 text-papyrus/40 transition hover:bg-red-500/15 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vista previa en Vivo estilo feed (Instagram / Facebook Mockup) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#e9e2d2]/70">
              Vista Previa en Vivo
            </h2>
            <div className="flex rounded-xl border border-[#c7a45a]/18 bg-white/[0.04] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPreviewPlatform("instagram")}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  previewPlatform === "instagram"
                    ? "border border-[#c7a45a]/40 bg-[#c7a45a]/15 text-[#f7f2e7]"
                    : "text-[#e9e2d2]/55 hover:text-[#e9e2d2]"
                }`}
              >
                Instagram
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlatform("facebook")}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  previewPlatform === "facebook"
                    ? "border border-[#c7a45a]/40 bg-[#c7a45a]/15 text-[#f7f2e7]"
                    : "text-[#e9e2d2]/55 hover:text-[#e9e2d2]"
                }`}
              >
                Facebook
              </button>
            </div>
          </div>

          {/* Tarjeta Glassmorphism de Smartphone / Feed */}
          <div className="overflow-hidden glass-panel rounded-3xl">
            {/* Cabecera del Post */}
            <div className="flex items-center gap-3 border-b border-[#c7a45a]/14 p-3.5">
              <span className="grid size-9 place-items-center rounded-full bg-gradient-to-tr from-[#ff7a1a] to-[#c7a45a] p-0.5">
                <span className="grid size-full place-items-center rounded-full bg-[#0b1020]">
                  <Flame size={16} className="text-[#FF7300]" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#e9e2d2]">
                  {previewPlatform === "instagram" ? "dharmakadabra" : "Dharma Kadabra Oficial"}
                </p>
                <p className="text-[10px] text-[#e9e2d2]/40">
                  {previewPlatform === "instagram" ? "Audio original · Templo Sagrado" : "Página espiritual · 1 min"}
                </p>
              </div>
              <span className="text-xs text-[#e9e2d2]/40">•••</span>
            </div>

            {/* Imagen del Post */}
            <div className="relative aspect-square w-full overflow-hidden bg-obsidian-soft/60">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt="Vista previa del post"
                  fill
                  sizes="380px"
                  className="object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-xs text-papyrus/40">
                  Sin imagen seleccionada
                </div>
              )}
            </div>

            {/* Acciones sociales */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 text-[#e9e2d2]">
                <Heart size={18} className="cursor-pointer hover:text-red-500" />
                <MessageCircle size={18} className="cursor-pointer hover:text-[#e3c57c]" />
                <Send size={18} className="cursor-pointer hover:text-[#e3c57c]" />
              </div>
              <span className="text-[10px] font-semibold text-[#e9e2d2]/40">
                Programado: {scheduleDate}
              </span>
            </div>

            {/* Copy y Comentarios */}
            <div className="p-3 pt-0">
              <p className="text-xs font-semibold text-[#e9e2d2]">
                {previewPlatform === "instagram" ? "1,248 me gusta" : "892 reacciones"}
              </p>
              <div className="mt-1.5 text-xs leading-relaxed text-[#e9e2d2]/80">
                <span className="font-semibold text-[#e9e2d2] mr-1.5">
                  {previewPlatform === "instagram" ? "dharmakadabra" : "Dharma Kadabra"}
                </span>
                <span className="whitespace-pre-wrap">
                  {content.trim() ||
                    "Aquí se visualizará el texto que redactes en tiempo real para tu comunidad..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
