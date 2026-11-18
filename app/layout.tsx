import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dharma Kadabra | Talismanes con propósito",
  description:
    "Talismanes consagrados y piezas artesanales para acompañarte a despertar tu propósito. Tu protección hecha arte.",
  icons: {
    icon: "/brand/logo.png",
  },
  openGraph: {
    title: "Dharma Kadabra | Tu protección hecha arte",
    description:
      "Piezas artesanales creadas con intención, alquimia y refugio.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
