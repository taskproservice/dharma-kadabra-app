import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowUpRight, AudioLines, CalendarDays, CreditCard, Palette, ShoppingCart, TrendingUp, UserRound, Video, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { getStaffPrincipal, parseRole, ROLE_PERMISSIONS, ROLE_PREVIEW_COOKIE, type Role } from "../../lib/rbac";

const week = [
  { day: "Lun", amount: 38 }, { day: "Mar", amount: 57 }, { day: "Mié", amount: 46 },
  { day: "Jue", amount: 76 }, { day: "Vie", amount: 61 }, { day: "Sáb", amount: 92 }, { day: "Dom", amount: 70 },
];
const points = week.map((item, i) => `${40 + i * 94},${190 - item.amount * 1.55}`).join(" ");

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
    { title: "Audios", description: "Gestiona y consulta los recursos de audio.", href: "/dashboard/audio", icon: AudioLines, label: "Abrir audios" },
    { title: "Video", description: "Consulta el espacio de video del equipo.", href: "/dashboard/video", icon: Video, label: "Abrir videos" },
    { title: "Redes Sociales", description: "Organiza el contenido y las publicaciones.", href: "/dashboard/redes", icon: Palette, label: "Ver contenido" },
  ],
  CLIENT: [
    { title: "Mi Perfil", description: "Consulta tu información personal.", href: "/dashboard/perfil", icon: UserRound, label: "Ver mi perfil" },
  ],
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const staff = await getStaffPrincipal();
  const cookieStore = await cookies();
  const previewRole = staff?.role === "ADMIN" ? parseRole(cookieStore.get(ROLE_PREVIEW_COOKIE)?.value) : null;
  const role = previewRole ?? staff?.role ?? "CLIENT";
  const roleConfig = ROLE_PERMISSIONS[role];
  const isAdmin = role === "ADMIN";
  const cards = shortcuts[role].filter((item) => roleConfig.isAllowed(item.href));

  return <div className="mx-auto max-w-7xl space-y-7">
    <div>
      <p className="text-sm font-medium text-[#9A7B28]">{new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Centro de comando</h1>
      <p className="mt-2 text-[#3E2723]/60">{isAdmin ? "Una mirada serena a la actividad de tu negocio." : "Tus espacios de trabajo, reunidos en un solo lugar."}</p>
    </div>

    <section aria-label="Accesos rápidos" className={`grid gap-5 ${cards.length > 2 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2"}`}>
      {cards.map(({ title, description, href, icon: Icon, label }) => (
        <Link key={href} href={href} className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#A98419] focus-visible:ring-offset-2">
          <Card className="h-full border-[#D4AF37]/20 bg-white/55 transition duration-200 group-hover:-translate-y-1 group-hover:border-[#D4AF37]/55 group-hover:bg-white/80 group-hover:shadow-[0_18px_38px_rgba(62,39,35,0.09)]">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#D4AF37]/15 text-[#8B6D16] transition group-hover:bg-[#D4AF37]/25"><Icon size={22} strokeWidth={1.7} /></span>
              <ArrowUpRight size={18} className="text-[#3E2723]/35 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#8B6D16]" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-2 min-h-10 leading-6">{description}</CardDescription>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#8B6D16]">{label}<ArrowUpRight size={14} /></span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>

    {isAdmin && <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Ventas del día</CardDescription><CardTitle className="mt-2 text-2xl">$18,450 <span className="text-xs font-medium text-emerald-700">+12.8%</span></CardTitle></div><span className="rounded-xl bg-[#D4AF37]/15 p-3 text-[#9A7B28]"><TrendingUp size={21}/></span></CardHeader><CardContent><p className="text-xs text-[#3E2723]/50">12 transacciones completadas</p></CardContent></Card>
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Ticket promedio</CardDescription><CardTitle className="mt-2 text-2xl">$1,537.50</CardTitle></div><span className="rounded-xl bg-[#D4AF37]/15 p-3 text-[#9A7B28]"><CreditCard size={21}/></span></CardHeader><CardContent><p className="text-xs text-[#3E2723]/50">En las ventas de hoy</p></CardContent></Card>
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardDescription>Citas agendadas</CardDescription><CardTitle className="mt-2 text-2xl">8 <span className="text-sm font-medium text-[#3E2723]/50">para hoy</span></CardTitle></div><span className="rounded-xl bg-[#D4AF37]/15 p-3 text-[#9A7B28]"><CalendarDays size={21}/></span></CardHeader><CardContent><p className="text-xs text-[#3E2723]/50">Próxima cita a las 11:30</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Ventas semanales</CardTitle><CardDescription>Ingresos de los últimos siete días</CardDescription></CardHeader><CardContent>
        <div className="flex items-center gap-2 text-sm font-medium"><span className="size-2.5 rounded-full bg-[#D4AF37]"/>Ingresos</div>
        <div className="mt-5 overflow-hidden"><svg viewBox="0 0 650 230" className="h-64 w-full" role="img" aria-label="Gráfica de ventas semanales">
          {[40, 90, 140, 190].map((y) => <g key={y}><line x1="40" y1={y} x2="604" y2={y} stroke="#3E2723" strokeOpacity=".1" strokeDasharray="4 5"/><text x="6" y={y + 4} fontSize="11" fill="#3E2723" opacity=".5">${Math.round((190-y)*80)}k</text></g>)}
          <polyline points={points} fill="none" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {week.map((item, i) => <g key={item.day}><circle cx={40 + i * 94} cy={190 - item.amount * 1.55} r="5" fill="#3E2723"/><text x={40 + i * 94} y="218" textAnchor="middle" fontSize="12" fill="#3E2723" opacity=".65">{item.day}</text></g>)}
        </svg></div>
      </CardContent></Card>
    </>}
  </div>;
}
