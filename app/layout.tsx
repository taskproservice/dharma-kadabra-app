import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Fuentes autoalojadas vía next/font: se sirven desde el propio dominio,
// se precargan, usan `font-display: swap` y generan un fallback métrico
// ajustado (sin bloqueo de render ni saltos de layout).
// Archivos: Inter, Playfair Display y Cormorant Garamond (subset latin, OFL 1.1).
const playfair = localFont({
  src: [
    { path: "./fonts/PlayfairDisplay-Variable.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/PlayfairDisplay-Italic-Variable.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

const inter = localFont({
  src: [{ path: "./fonts/Inter-Variable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Dharma Kadabra · La sabiduría antigua, viva en tu presente",
  description: "Plataforma digital para acercar la sabiduría espiritual ancestral al mundo moderno.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${playfair.variable} ${cormorant.variable} ${inter.variable}`}>
      <body className="bg-[#F4EFE6] text-[#1A1A1A] font-sans antialiased">{children}</body>
    </html>
  );
}
