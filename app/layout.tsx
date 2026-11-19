import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dharma Kadabra · Administración",
  description: "Panel administrativo de Dharma Kadabra",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
