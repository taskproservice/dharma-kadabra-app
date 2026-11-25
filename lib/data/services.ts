/**
 * Servicios agendables de la casa (sesiones con guía).
 *
 * Misma idea que `products.ts` / `collaborators.ts`: estructura lista para
 * migrar a un modelo `Service` de Prisma y conectar con la Agenda.
 */
export type Service = {
  id: string;
  name: string;
  /** Frase editorial que resume la esencia del servicio. */
  essence: string;
  description: string;
  duration: string;
  price: number;
  /** Símbolo decorativo mostrado en la tarjeta. */
  symbol: string;
};

export const services: Service[] = [
  {
    id: "registros-akashicos",
    name: "Lectura de Registros Akáshicos",
    essence: "La memoria del alma",
    description:
      "Todo lo que tu alma ha vivido y aprendido habita en una memoria sutil. En esta sesión abrimos ese espacio para escuchar sus respuestas, traer luz a tus encrucijadas y reconectar con tu verdad interior.",
    duration: "60 min",
    price: 1600,
    symbol: "✧",
  },
  {
    id: "lectura-de-runas",
    name: "Lectura de Runas",
    essence: "La brújula terrenal",
    description:
      "Las runas son una brújula terrenal: símbolos antiguos que leen tu momento presente y orientan tus próximos pasos con claridad. Donde los Registros guardan la memoria del alma, las runas iluminan el camino concreto que caminas hoy.",
    duration: "60 min",
    price: 1200,
    symbol: "ᚱ",
  },
];

/** Precio de sesión en MXN: `$1,600 MXN`. */
export const formatSessionPrice = (price: number) =>
  `$${new Intl.NumberFormat("es-MX").format(price)} MXN`;
