/**
 * Equipo de colaboradores — fuente única de datos.
 *
 * Lo consumen tanto la Landing ("Personas que acompañan") como el Dashboard
 * (`/dashboard/colaboradores`); al conectar la base de datos ambos se
 * actualizan a la vez. Replica el futuro modelo `Collaborator` de Prisma:
 *
 * ```prisma
 * model Collaborator {
 *   id        String   @id @default(cuid())
 *   name      String
 *   specialty String
 *   bio       String
 *   photoUrl  String
 *   email     String   @unique
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * }
 * ```
 */
export type Collaborator = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  email: string;
};

export const collaborators: Collaborator[] = [
  {
    id: "lucia-moreno",
    name: "Lucía Moreno",
    specialty: "Terapeuta holística",
    bio: "Acompaña procesos de sanación integrando cuerpo, emoción y energía. Su consulta es un espacio seguro para soltar lo que pesa y volver al equilibrio.",
    photoUrl: "/images/equipo/lucia-moreno.jpg",
    email: "lucia@dharmakadabra.mx",
  },
  {
    id: "mateo-sanchez",
    name: "Mateo Sánchez",
    specialty: "Lector de runas",
    bio: "Intérprete del Futhark antiguo. Usa las runas como brújula terrenal: lee el momento presente y orienta los próximos pasos con claridad y honestidad.",
    photoUrl: "/images/equipo/mateo-sanchez.jpg",
    email: "mateo@dharmakadabra.mx",
  },
  {
    id: "isabel-vega",
    name: "Isabel Vega",
    specialty: "Guía de meditación",
    bio: "Guía de meditación y respiración consciente. Diseña prácticas sencillas que caben en la vida real para cultivar calma, presencia y autocuidado.",
    photoUrl: "/images/equipo/isabel-vega.jpg",
    email: "isabel@dharmakadabra.mx",
  },
];

/** Iniciales para avatares de respaldo (p. ej. colaboradores sin foto). */
export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
