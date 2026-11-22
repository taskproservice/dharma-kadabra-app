import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowUpRight, AudioLines, CalendarDays, CreditCard, Palette, ShoppingCart, TrendingUp, UserRound, Video, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { getStaffPrincipal, parseRole, ROLE_PERMISSIONS, ROLE_PREVIEW_COOKIE, type Role } from "../../lib/rbac";
import { prisma } from "../../lib/prisma";

const shortcuts: Record<Role, { title: string; description: string; href: string; icon: LucideIcon; label: string }[]> = {
  ADMIN: [
    { title: "Punto de Venta", description: "Registra productos, servicios y cobros desde una sola terminal.", href: "/dashboard/pos", icon: ShoppingCart, label: "Abrir terminal" },
    { title: "Calendario de Citas", description: "Consulta la agenda y administra los próximos encuentros.", href: "/dashboard/agenda", icon: CalendarDays, label: "Ver calendario" },
  ],
  ENGINEER: [
    { title: "Punto de Venta", description: "Accede a la terminal para apoyar la operación diaria.", href: "/dashboard/pos", icon: ShoppingCart, label: "Abrir terminal" },
    { title: "Calendario de Citas", description: "Consulta la agenda y administra los próximos encuentros.", href: "/dashboard/agenda", icon: CalendarDays, label: "Ver calendario" },
  ],
  COLLABORATOR: [
    { title: "Mi Agenda", description: "Consulta tus citas y prepara tus próximos encuentros.", href: "/dashboard/agenda", icon: CalendarDays, label: "Ver mi agenda" },
    { title: "Mi Perfil", description: "Revisa tu perfil y la información que compartes.", href: "/dashboard/perfil", icon: UserRound, label: "Ver mi perfil" },
    { title: "Audios", description: "Accede a los recursos de audio del equipo.", href: "/dashboard/audio", icon: AudioLines, label: "Escuchar audios" },
  ],
  SOCIAL_MEDIA: [
    { title: "Redes Sociales", description: "Organiza el contenido y las publicaciones.", href: "/dashboard/redes", icon: Palette, label: "Ver contenido" },
    { title: "Audios", description: "Gestiona y consulta los recursos de audio.", href: "/dashboard/audio", icon: AudioLines, label: "Abrir audios" },
    { title: "Video", description: "Consulta el espacio de video del equipo.", href: "/dashboard/video", icon: Video, label: "Abrir videos" },
  ],
  CLIENT: [
    { title: "Mi Perfil", description: "Consulta tu información personal.", href: "/dashboard/perfil", icon: UserRound, label: "Ver mi perfil" },
  ],
};

export const dynamic = "force-dynamic";

const money = (value: number, decimals = 0) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

type Kpis = {
  salesToday: number;
  salesCount: number;
  averageTicket: number;
  appointmentsToday: number;
  nextAppointmentLabel: string;
  productCount: number;
  week: { day: string; amount: number }[];
  weekTotal: number;
};

const EMPTY_KPIS: Kpis = {
  salesToday: 0,
  salesCount: 0,
  averageTicket: 0,
  appointmentsToday: 0,
  nextAppointmentLabel: "Sin citas para hoy",
  productCount: 0,
  week: [],
  weekTotal: 0,
};

/**
 * KPIs reales desde Prisma:
 * - Ventas del día / ticket promedio: `Purchase` de hoy (suma del precio
 *   del `Product` ligado; sin datos → 0, nunca cifras inventadas).
 * - Citas: `Appointment` de hoy + próxima cita.
 * - Gráfica semanal: compras de los últimos 7 días por día.
 * Si la base de datos no responde, todo queda en 0.
 */
async function loadKpis(): Promise<Kpis> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const weekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    weekAgo.setHours(0, 0, 0, 0);

    const [purchasesToday, appointmentsToday, weekPurchases, productCount] = await Promise.all([
      prisma.purchase.findMany({ where: { purchasedAt: { gte: startOfDay, lte: endOfDay } }, include: { product: true } }),
      prisma.appointment.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } }, orderBy: { date: "asc" } }),
      prisma.purchase.findMany({ where: { purchasedAt: { gte: weekAgo } }, include: { product: true } }),
      prisma.product.count(),
    ]);

    const priceOf = (purchase: { product?: { price: number } | null }) => purchase.product?.price ?? 0;
    const salesToday = purchasesToday.reduce((sum: number, purchase: { product?: { price: number } | null }) => sum + priceOf(purchase), 0);
    const salesCount = purchasesToday.length;
    const averageTicket = salesCount > 0 ? salesToday / salesCount : 0;

    const next = appointmentsToday.find((appointment: { date: Date }) => new Date(appointment.date) >= now) ?? appointmentsToday[0];
    const nextAppointmentLabel = next
      ? `Próxima cita a las ${new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(next.date))}`
      : "Sin citas para hoy";

    const week: { day: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(day).replace(".", "");
      week.push({ day: label.charAt(0).toUpperCase() + label.slice(1), amount: 0 });
    }
    for (const purchase of weekPurchases) {
      const purchasedAt = new Date(purchase.purchasedAt);
      const index = Math.floor((purchasedAt.getTime() - weekAgo.getTime()) / (24 * 60 * 60 * 1000));
      if (index >= 0 && index < week.length) week[index].amount += priceOf(purchase);
    }

    return {
      salesToday,
      salesCount,
      averageTicket,
      appointmentsToday: appointmentsToday.length,
      nextAppointmentLabel,
      productCount,
      week,
      weekTotal: week.reduce((sum, item) => sum + item.amount, 0),
    };
  } catch {
    return EMPTY_KPIS;
  }
}

export default async function DashboardPage() {
  const staff = await getStaffPrincipal();
  const cookieStore = await cookies();
  const previewRole = staff?.role === "ADMIN" ? parseRole(cookieStore.get(ROLE_PREVIEW_COOKIE)?.value) : null;
  const role = previewRole ?? staff?.role ?? "CLIENT";
  const roleConfig = ROLE_PERMISSIONS[role];
  const isAdmin = role === "ADMIN";
  const showKpis = role === "ADMIN" || role === "ENGINEER";
  const kpis = showKpis ? await loadKpis() : EMPTY_KPIS;

  const quickAccess = [
    { title: "Punto de Venta", description: "Terminal de cobro con catálogo, categorías y carrito en tiempo real.", href: "/dashboard/pos", icon: ShoppingCart, label: "Abrir terminal", meta: `${kpis.productCount} productos en catálogo` },
    { title: "Agenda", description: "Citas del día, slots editoriales y recordatorios de WhatsApp.", href: "/dashboard/agenda", icon: CalendarDays, label: "Ver agenda", meta: `${kpis.appointmentsToday} citas para hoy` },
  ].filter((item) => roleConfig.isAllowed(item.href));

  const cards = shortcuts[role]
    .filter((item) => roleConfig.isAllowed(item.href))
    .filter((item) => !quickAccess.some((quick) => quick.href === item.href));

  const weekMax = Math.max(...kpis.week.map((item) => item.amount), 1);
  const points = kpis.week.map((item, index) => `${40 + index * 94},${190 - (item.amount / weekMax) * 140}`).join(" ");

  return <div className="mx-auto max-w-7xl space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow-gold">{new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p>
        <h1 className="mt-3 font-display text-4xl text-[#f7f2e7]">Centro de comando</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#e9e2d2]/55">{isAdmin ? "Una mirada serena a la actividad de tu negocio." : "Tus espacios de trabajo, reunidos en un solo lugar."}</p>
      </div>
      <span className="rounded-full border border-[#c7a45a]/30 bg-[#c7a45a]/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-[#d8bc7f]">
        {roleConfig.label}
      </span>
    </div>

    {quickAccess.length > 0 && (
      <section aria-label="Acceso rápido" className="grid gap-5 md:grid-cols-2">
        {quickAccess.map(({ title, description, href, icon: Icon, label, meta }) => (
          <Link key={href} href={href} className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1020]">
            <article className="relative h-full overflow-hidden rounded-2xl border border-[#c7a45a]/25 bg-[linear-gradient(150deg,rgba(199,164,90,.16)_0%,rgba(17,24,43,.85)_45%,rgba(11,16,32,.9)_100%)] p-6 text-[#f7f2e7] shadow-[0_30px_70px_-34px_rgba(0,0,0,.9)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[#c7a45a]/55 sm:p-8">
              <span className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-[#c7a45a]/20 blur-3xl transition group-hover:bg-[#c7a45a]/30" aria-hidden="true" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e3c57c]/70 to-transparent" />
              <div className="relative flex items-start justify-between gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-[#c7a45a]/40 bg-[#c7a45a]/15 text-[#e3c57c] transition group-hover:scale-105">
                  <Icon size={26} strokeWidth={1.5} />
                </span>
                <ArrowUpRight size={22} className="text-[#d8bc7f] transition group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
              <h2 className="relative mt-6 font-display text-3xl leading-tight">{title}</h2>
              <p className="relative mt-2 max-w-md text-sm font-light leading-6 text-[#e9e2d2]/65">{description}</p>
              <div className="relative mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#c7a45a] px-4 py-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#0b1020] transition group-hover:bg-[#e3c57c]">
                  {label} <ArrowUpRight size={13} />
                </span>
                <span className="text-xs text-[#e9e2d2]/50">{meta}</span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    )}

    {cards.length > 0 && (
      <section aria-label="Accesos rápidos" className={`grid gap-5 ${cards.length > 2 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2"}`}>
        {cards.map(({ title, description, href, icon: Icon, label }) => (
          <Link key={href} href={href} className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1020]">
            <Card className="glass-panel-hover h-full">
              <CardHeader className="flex-row items-start justify-between gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f] transition group-hover:border-[#c7a45a]/60 group-hover:bg-[#c7a45a]/18"><Icon size={22} strokeWidth={1.6} /></span>
                <ArrowUpRight size={18} className="text-[#e9e2d2]/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#d8bc7f]" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="mt-2 min-h-10 leading-6">{description}</CardDescription>
                <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d8bc7f]">{label}<ArrowUpRight size={13} /></span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    )}

    {showKpis && <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Ventas del día</CardDescription><CardTitle className="mt-2 font-display text-3xl">{money(kpis.salesToday)}</CardTitle></div><span className="grid size-11 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]"><TrendingUp size={20}/></span></CardHeader><CardContent><p className="text-xs text-[#e9e2d2]/45">{kpis.salesCount} {kpis.salesCount === 1 ? "transacción completada" : "transacciones completadas"}</p></CardContent></Card>
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Ticket promedio</CardDescription><CardTitle className="mt-2 font-display text-3xl">{money(kpis.averageTicket, 2)}</CardTitle></div><span className="grid size-11 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]"><CreditCard size={20}/></span></CardHeader><CardContent><p className="text-xs text-[#e9e2d2]/45">En las ventas de hoy</p></CardContent></Card>
        <Card className="sm:col-span-2 lg:col-span-1"><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Citas agendadas</CardDescription><CardTitle className="mt-2 font-display text-3xl">{kpis.appointmentsToday} <span className="text-sm font-sans font-medium text-[#e9e2d2]/45">para hoy</span></CardTitle></div><span className="grid size-11 place-items-center rounded-xl border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]"><CalendarDays size={20}/></span></CardHeader><CardContent><p className="text-xs text-[#e9e2d2]/45">{kpis.nextAppointmentLabel}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="font-display text-2xl">Ventas semanales</CardTitle><CardDescription>Ingresos de los últimos siete días · Total {money(kpis.weekTotal)}</CardDescription></CardHeader><CardContent>
        <div className="flex items-center gap-2 text-sm font-medium text-[#e9e2d2]/80"><span className="size-2.5 rounded-full bg-[#e3c57c] shadow-[0_0_10px_rgba(227,197,124,.8)]"/>Ingresos</div>
        <div className="mt-5 overflow-hidden">
          {kpis.weekTotal === 0 ? (
            <p className="grid h-64 place-items-center rounded-xl border border-dashed border-[#c7a45a]/20 text-center text-sm text-[#e9e2d2]/40">
              Aún no hay ventas en los últimos 7 días.
            </p>
          ) : (
            <svg viewBox="0 0 650 230" className="h-64 w-full" role="img" aria-label="Gráfica de ventas semanales">
              <defs>
                <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c7a45a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#c7a45a" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 90, 140, 190].map((y) => <g key={y}><line x1="40" y1={y} x2="604" y2={y} stroke="#c7a45a" strokeOpacity=".14" strokeDasharray="4 5"/><text x="6" y={y + 4} fontSize="11" fill="#e9e2d2" opacity=".35">${Math.round((190-y)*80)}k</text></g>)}
              <polyline points={`40,190 ${points} 604,190`} fill="url(#salesArea)" stroke="none" />
              <polyline points={points} fill="none" stroke="#d8bc7f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              {kpis.week.map((item, i) => <g key={`${item.day}-${i}`}><circle cx={40 + i * 94} cy={190 - (item.amount / weekMax) * 140} r="5" fill="#0b1020" stroke="#e3c57c" strokeWidth="2.5"/><text x={40 + i * 94} y="218" textAnchor="middle" fontSize="12" fill="#e9e2d2" opacity=".5">{item.day}</text></g>)}
            </svg>
          )}
        </div>
      </CardContent></Card>
    </>}
  </div>;
}
