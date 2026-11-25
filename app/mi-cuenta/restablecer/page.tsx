import type { Metadata } from "next";
import Link from "next/link";
import { CozyWidget } from "../../../components/landing/cozy-widget";
import { PremiumFooter } from "../../../components/landing/premium-footer";
import { PublicHeader } from "../../../components/landing/public-header";
import { CustomerResetForm } from "../../../components/customer-reset-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restablecer contraseña · Dharma Kadabra",
  description: "Elige una contraseña nueva para tu cuenta de Dharma Kadabra.",
};

export default async function PasswordResetPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const raw = params.token;
  const token = Array.isArray(raw) ? raw[0] : raw;

  return (
    <div className="flex min-h-screen flex-col bg-[#F4EFE6] text-[#2C241B]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16 pt-[76px]">
        <div className="pt-10">
          {token ? (
            <CustomerResetForm token={token} />
          ) : (
            <div className="rounded-3xl border border-stone-200/50 bg-[#FCFAF5] p-8 text-center shadow-sm">
              <h1 className="font-display text-3xl text-[#2C241B]">Enlace no válido</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-600">
                Este enlace de recuperación no es válido. Solicita uno nuevo desde Mi Cuenta.
              </p>
              <Link
                href="/mi-cuenta"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#241E18] px-6 py-3 text-sm font-semibold text-[#FCFAF5] transition hover:bg-[#3A3026]"
              >
                Ir a Mi Cuenta
              </Link>
            </div>
          )}
        </div>
      </main>
      <PremiumFooter />
      <CozyWidget />
    </div>
  );
}
