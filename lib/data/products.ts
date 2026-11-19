/**
 * Catálogo de la tienda virtual (Colección boutique).
 *
 * La estructura replica el futuro modelo `Product` de Prisma:
 *
 * ```prisma
 * model Product {
 *   id          String   @id @default(cuid())
 *   name        String
 *   description String
 *   price       Decimal  @db.Money   // USD
 *   imageUrl    String
 *   category    String
 *   createdAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 * }
 * ```
 *
 * Cuando se conecte la base de datos basta sustituir este arreglo por
 * `prisma.product.findMany()`; los componentes consumen el mismo tipo.
 */
export type Product = {
  id: string;
  name: string;
  description: string;
  /** Precio en USD (se formatea con `formatPrice`). */
  price: number;
  imageUrl: string;
  category: "Talismanes" | "Ritual" | "Cristales" | string;
};

export const products: Product[] = [
  {
    id: "talisman-solar",
    name: "Talismán Solar",
    description: "Medallón de sol en dorado con ámbar · protección y vitalidad",
    price: 88,
    imageUrl: "/images/productos/talisman-solar.jpg",
    category: "Talismanes",
  },
  {
    id: "amuleto-lunar",
    name: "Amuleto Lunar",
    description: "Luna creciente con lapislázuli · intuición y calma",
    price: 96,
    imageUrl: "/images/productos/amuleto-lunar.jpg",
    category: "Talismanes",
  },
  {
    id: "set-runas-antiguas",
    name: "Set de Runas Antiguas",
    description: "Madera tallada a mano · 24 símbolos del Futhark",
    price: 72,
    imageUrl: "/images/productos/set-runas.jpg",
    category: "Ritual",
  },
  {
    id: "cuarzo-claro",
    name: "Cuarzo Claro",
    description: "Punta pulida · claridad mental y enfoque",
    price: 54,
    imageUrl: "/images/productos/cuarzo-claro.jpg",
    category: "Cristales",
  },
  {
    id: "vela-de-intencion",
    name: "Vela de Intención",
    description: "Cera de soya, hierbas y dije dorado · ritual de apertura",
    price: 42,
    imageUrl: "/images/productos/vela-intencion.jpg",
    category: "Ritual",
  },
];

/** Formato editorial de precio: `$88.00 USD`. */
export const formatPrice = (price: number) =>
  `$${price.toFixed(2)} USD`;
