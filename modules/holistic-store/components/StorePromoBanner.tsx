import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StorePromoBanner() {
  return (
    <section className="relative overflow-hidden bg-[#2A2118]">
      <div className="absolute inset-0">
        <Image
          src="/images/hero/altar-ritual.jpg"
          alt="Altar con vela y piedras naturales"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(32,25,18,0.88)_0%,rgba(32,25,18,0.72)_38%,rgba(32,25,18,0.38)_70%,rgba(32,25,18,0.50)_100%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:py-28">
        <div className="max-w-2xl">
          <p className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.35em] text-[#D4B062]">
            <span aria-hidden="true" className="h-px w-12 bg-[#C5A059]" />
            Conecta contigo
          </p>
          <h2 className="mt-7 font-display text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.98] tracking-[-0.02em] text-[#F7F3EA]">
            Encuentra el
            <br />
            <em className="italic text-[#D4B062]">equilibrio</em> que
            <br />
            mereces
          </h2>
          <p className="mt-8 max-w-xl text-[17px] leading-8 text-[#E8E1D5]/85">
            Descubre herramientas y accesorios diseñados para acompañarte en tu camino.
          </p>
          <div className="mt-10">
            <Link
              href="#productos-destacados"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#C5A059] px-8 py-4 text-[16px] font-semibold text-[#2C241B] shadow-[0_12px_30px_rgba(197,160,89,0.25)] transition hover:bg-[#D1AE68]"
            >
              Explora la colección
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}
