import { notFound, redirect } from "next/navigation";
import AdminPanelPage from "../admin/view";
import AgendaPage from "../agenda/view";
import AgenteMarketingPage from "../agente-marketing/view";
import AgenteVentasPage from "../agente-ventas/view";
import AudioPage from "../audio/view";
import ColaboradoresPage from "../colaboradores/view";
import CozyPage from "../cozy/view";
import DisenoPage from "../diseno/view";
import EventsPage from "../eventos/view";
import InfoPage from "../info/view";
import IngenieriaPage from "../ingenieria/view";
import InventarioPage from "../inventario/view";
import MarketingPage from "../marketing/view";
import { redirectDashboardHome } from "../view";
import PagosPage from "../pagos/view";
import PerfilPage from "../perfil/view";
import PosPage from "../pos/view";
import RedesPage from "../redes/view";
import RunasPage from "../runas/view";
import TourDashboardPage from "../tour/view";
import VentasPage from "../ventas/view";
import VideoPage from "../video/view";

export const dynamic = "force-dynamic";

/**
 * Dashboard catch-all: retains every existing /dashboard URL while making
 * Next.js emit one SSR function for the entire authenticated dashboard.
 */
export default async function DashboardRouter({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const route = (await params).slug?.join("/") ?? "";

  switch (route) {
    case "":
      return redirectDashboardHome();
    case "admin":
      return <AdminPanelPage />;
    case "agenda":
      return <AgendaPage />;
    case "agente-marketing":
      return <AgenteMarketingPage />;
    case "agente-ventas":
      return <AgenteVentasPage />;
    case "audio":
      return <AudioPage />;
    case "colaboradores":
      return <ColaboradoresPage />;
    case "cozy":
      return <CozyPage />;
    case "diseno-base":
      redirect("/dashboard/diseno");
    case "diseno":
      return <DisenoPage />;
    case "eventos":
      return <EventsPage />;
    case "info":
      return <InfoPage />;
    case "informacion-general":
      redirect("/dashboard/info");
    case "ingenieria":
      return <IngenieriaPage />;
    case "inventario":
      return <InventarioPage />;
    case "marketing":
      return <MarketingPage />;
    case "pagos":
      return <PagosPage />;
    case "panel-administrativo":
      redirect("/dashboard/admin");
    case "pasarela-pagos":
      redirect("/dashboard/pagos");
    case "perfil":
      return <PerfilPage />;
    case "pos":
      return <PosPage />;
    case "redes":
      return <RedesPage />;
    case "resumen":
      redirect("/dashboard");
    case "runas":
      return <RunasPage />;
    case "tour":
      return <TourDashboardPage />;
    case "ventas":
      return <VentasPage />;
    case "video":
      return <VideoPage />;
    default:
      notFound();
  }
}
