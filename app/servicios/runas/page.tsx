import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { RuneExperience } from "../../../components/landing/runes/rune-experience";
import "./runes.css";

/** Tipografía editorial de esta página; el cuerpo usa el Inter global del layout. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

export const metadata: Metadata = {
  title: "Lectura de Runas · El lenguaje del destino | Dharma Kadabra",
  description:
    "Explora las 25 runas de la lectura, conoce su significado, realiza una tirada de tres símbolos y agenda tu lectura guiada con Dharma Kadabra.",
};

export default function RunasPage() {
  return (
    <div className={cormorant.variable}>
      <RuneExperience fontClassName={cormorant.variable} />
    </div>
  );
}
