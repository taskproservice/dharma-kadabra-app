import { Award, Globe, Headphones, Lock, Truck } from "lucide-react";

const BADGES = [
  {
    icon: Truck,
    title: "Envíos a todo México",
    description: "Entrega segura y confiable",
  },
  {
    icon: Globe,
    title: "Envíos a USA",
    description: "Llevamos tu energía más lejos.",
  },
  {
    icon: Lock,
    title: "Compra segura",
    description: "Tus datos protegidos",
  },
  {
    icon: Award,
    title: "Productos auténticos",
    description: "Calidad garantizada",
  },
  {
    icon: Headphones,
    title: "Soporte personalizado",
    description: "Estamos para ayudarte",
  },
];

export function TrustBadges() {
  return (
    <section aria-label="Beneficios de compra" className="bg-[#F7F3EA] px-5 py-14 sm:px-8 lg:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6">
        {BADGES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex min-w-0 items-start gap-3.5">
            <span className="mt-0.5 grid size-12 shrink-0 place-items-center rounded-full bg-[#EFE4CD] text-[#8B6914] sm:size-13">
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[1.45rem] leading-[1.15] text-[#2C241B]">{title}</p>
              <p className="mt-1 text-[14px] leading-6 text-[#6B5D4A]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
