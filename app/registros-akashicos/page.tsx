import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { AkashicBenefits } from "../../components/akashic/akashic-benefits";
import { AkashicBooking } from "../../components/akashic/akashic-booking";
import { AkashicExperience } from "../../components/akashic/akashic-experience";
import { AkashicFAQ } from "../../components/akashic/akashic-faq";
import { AkashicHeader } from "../../components/akashic/akashic-header";
import { AkashicHero } from "../../components/akashic/akashic-hero";
import { AkashicIntroduction } from "../../components/akashic/akashic-introduction";
import { AkashicMethod } from "../../components/akashic/akashic-method";
import { AkashicProcess } from "../../components/akashic/akashic-process";
import { PremiumFooter } from "../../components/landing/premium-footer";
import "./akashic.css";

/** Tipografía editorial de esta página; el cuerpo usa el Inter global del layout. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

export const metadata: Metadata = {
  title: "Lectura de Registros Akáshicos · La memoria del alma | Dharma Kadabra",
  description:
    "Conoce la tradición de los Registros Akáshicos, su método y su proceso, y agenda tu lectura guiada de 60 minutos con Dharma Kadabra.",
};

export default function RegistrosAkashicosPage() {
  return (
    <div className={cormorant.variable}>
      <AkashicHeader />
      <main className="bg-[#121212] text-[#F7F3EA]">
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
    </div>
  );
}
