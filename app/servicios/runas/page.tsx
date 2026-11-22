import type { Metadata } from "next";
import { RuneExperience } from "../../../components/runes/rune-experience";
import "./runes.css";

export const metadata: Metadata = {
  title: "Lectura de Runas · El lenguaje del destino | Dharma Kadabra",
  description:
    "Explora las 25 runas de la lectura, conoce su significado, realiza una tirada de tres símbolos y agenda tu lectura guiada con Dharma Kadabra.",
};

export default function RunasPage() {
  return <RuneExperience />;
}
