/**
 * Seed del catálogo de Holistic Store (categorías: Pulseras, Cadenas, Runas,
 * Piedras + heredadas Collares y Veladoras para el POS). Crea/actualiza
 * productos en la tabla `Product` de Prisma con sus datos comerciales
 * (costo, margen, moneda, disponibilidad, publicado y stock).
 *
 * Uso (con DATABASE_URL configurada):
 *   node scripts/seed-products.mjs
 *
 * Requiere el cliente Prisma generado (`npm run build` o `npx prisma generate`).
 * Las imágenes reutilizan los assets locales de /public/images/productos/.
 */
import { PrismaClient } from "../src/generated/prisma/index.js";

const products = [
  // Pulseras
  { id: "pulsera-obsidiana", name: "Pulsera de Obsidiana", description: "Obsidiana negra · protección y arraigo", price: 450, cost: 180, currency: "MXN", availability: "available", published: true, stock: 12, imageUrl: "/images/productos/talisman-solar.jpg", category: "Pulseras" },
  { id: "pulsera-cuarzo", name: "Pulsera de Cuarzo Claro", description: "Cuarzo pulido · claridad y enfoque", price: 380, cost: 150, currency: "MXN", availability: "available", published: true, stock: 8, imageUrl: "/images/productos/cuarzo-claro.jpg", category: "Pulseras" },
  { id: "pulsera-ambar", name: "Pulsera de Ámbar", description: "Ámbar cálido · vitalidad y calma", price: 520, cost: 230, currency: "MXN", availability: "out_of_stock", published: true, stock: 0, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Pulseras" },
  // Cadenas
  { id: "cadena-talisman-solar", name: "Cadena Talismán Solar", description: "Medallón de sol en dorado con ámbar", price: 880, cost: 390, currency: "MXN", availability: "available", published: true, stock: 6, imageUrl: "/images/productos/talisman-solar.jpg", category: "Cadenas" },
  { id: "cadena-amuleto-lunar", name: "Cadena Amuleto Lunar", description: "Luna creciente con lapislázuli", price: 28, cost: 11, currency: "USD", availability: "available", published: true, stock: 4, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Cadenas" },
  // Collares (heredada, POS)
  { id: "collar-talisman-solar", name: "Collar Talismán Solar", description: "Medallón de sol en dorado con ámbar", price: 880, cost: 390, currency: "MXN", availability: "available", published: true, stock: 5, imageUrl: "/images/productos/talisman-solar.jpg", category: "Collares" },
  { id: "collar-amuleto-lunar", name: "Collar Amuleto Lunar", description: "Luna creciente con lapislázuli", price: 960, cost: 420, currency: "MXN", availability: "available", published: false, stock: 3, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Collares" },
  // Veladoras (heredada, POS)
  { id: "veladora-intencion", name: "Veladora de Intención", description: "Cera de soya, hierbas y dije dorado", price: 420, cost: 170, currency: "MXN", availability: "available", published: false, stock: 10, imageUrl: "/images/productos/vela-intencion.jpg", category: "Veladoras" },
  { id: "veladora-altar", name: "Veladora de Altar", description: "Para rituales de apertura y protección", price: 350, cost: 140, currency: "MXN", availability: "available", published: false, stock: 2, imageUrl: "/images/productos/vela-intencion.jpg", category: "Veladoras" },
  // Runas
  { id: "set-runas-madera", name: "Set de Runas de Madera", description: "Madera tallada a mano · 24 símbolos del Futhark", price: 720, cost: 300, currency: "MXN", availability: "available", published: true, stock: 7, imageUrl: "/images/productos/set-runas.jpg", category: "Runas" },
  { id: "runas-viaje", name: "Runas de Viaje", description: "Bolsa de tela y guía breve de lectura", price: 540, cost: 210, currency: "MXN", availability: "available", published: true, stock: 9, imageUrl: "/images/productos/set-runas.jpg", category: "Runas" },
  // Piedras
  { id: "piedra-cuarzo-claro", name: "Cuarzo Claro", description: "Punta pulida · claridad mental y enfoque", price: 350, cost: 120, currency: "MXN", availability: "available", published: true, stock: 15, imageUrl: "/images/productos/cuarzo-claro.jpg", category: "Piedras" },
  { id: "piedra-amatista", name: "Amatista Guardián", description: "Drusa natural · calma y protección del hogar", price: 32, cost: 13, currency: "USD", availability: "available", published: true, stock: 5, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Piedras" },
];

const withMargin = (product) => ({
  ...product,
  profitMargin:
    product.price > 0
      ? Math.round(((product.price - product.cost) / product.price) * 1000) / 10
      : 0,
});

const prisma = new PrismaClient();

try {
  for (const product of products.map(withMargin)) {
    const { id, ...data } = product;
    await prisma.product.upsert({ where: { id }, update: data, create: product });
  }
  const categories = [...new Set(products.map((product) => product.category))];
  console.log(`Catálogo listo: ${products.length} productos en ${categories.join(", ")} (Holistic Store + POS).`);
} catch (error) {
  console.error("No fue posible sembrar el catálogo:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
