import type { Metadata } from "next";
import { AkashicBenefits } from "../../components/akashic/akashic-benefits";
import { AkashicBooking } from "../../components/akashic/akashic-booking";
import { AkashicExperience } from "../../components/akashic/akashic-experience";
import { AkashicFAQ } from "../../components/akashic/akashic-faq";
import { AkashicHeader } from "../../components/akashic/akashic-header";
import { AkashicHero } from "../../components/akashic/akashic-hero";
import { AkashicIntroduction } from "../../components/akashic/akashic-introduction";
import { AkashicMethod } from "../../components/akashic/akashic-method";
import { AkashicProcess } from "../../components/akashic/akashic-process";
import { CozyWidget } from "../../components/landing/cozy-widget";
import { PremiumFooter } from "../../components/landing/premium-footer";
import "./akashic.css";

export const metadata: Metadata = {
  title: "Lectura de Registros Akáshicos · La memoria del alma | Dharma Kadabra",
  description:
    "Conoce la tradición de los Registros Akáshicos, su método y su proceso, y agenda tu lectura guiada de 60 minutos con Dharma Kadabra.",
};

export default function RegistrosAkashicosPage() {
  return (
    <>
      <AkashicHeader />
      <main className="bg-sanctuary-parchment text-sanctuary-ink">
        <AkashicHero />
        <AkashicIntroduction />
        <AkashicMethod />
        <AkashicBenefits />
        <AkashicProcess />
        <AkashicExperience />
        <AkashicFAQ />
        <AkashicBooking />
      </main>
      <PremiumFooter />
      <CozyWidget />
    </>
  );
}
