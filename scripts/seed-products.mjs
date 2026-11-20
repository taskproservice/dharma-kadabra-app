/**
 * Seed del catálogo del Punto de Venta (categorías: Pulseras, Collares,
 * Veladoras, Runas). Crea/actualiza productos en la tabla `Product`
 * de Prisma para que el POS (/dashboard/pos) tenga datos reales.
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
  { id: "pulsera-obsidiana", name: "Pulsera de Obsidiana", description: "Obsidiana negra · protección y arraigo", price: 450, imageUrl: "/images/productos/talisman-solar.jpg", category: "Pulseras" },
  { id: "pulsera-cuarzo", name: "Pulsera de Cuarzo Claro", description: "Cuarzo pulido · claridad y enfoque", price: 380, imageUrl: "/images/productos/cuarzo-claro.jpg", category: "Pulseras" },
  { id: "pulsera-ambar", name: "Pulsera de Ámbar", description: "Ámbar cálido · vitalidad y calma", price: 520, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Pulseras" },
  // Collares
  { id: "collar-talisman-solar", name: "Collar Talismán Solar", description: "Medallón de sol en dorado con ámbar", price: 880, imageUrl: "/images/productos/talisman-solar.jpg", category: "Collares" },
  { id: "collar-amuleto-lunar", name: "Collar Amuleto Lunar", description: "Luna creciente con lapislázuli", price: 960, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Collares" },
  // Veladoras
  { id: "veladora-intencion", name: "Veladora de Intención", description: "Cera de soya, hierbas y dije dorado", price: 420, imageUrl: "/images/productos/vela-intencion.jpg", category: "Veladoras" },
  { id: "veladora-altar", name: "Veladora de Altar", description: "Para rituales de apertura y protección", price: 350, imageUrl: "/images/productos/vela-intencion.jpg", category: "Veladoras" },
  // Runas
  { id: "set-runas-madera", name: "Set de Runas de Madera", description: "Madera tallada a mano · 24 símbolos del Futhark", price: 720, imageUrl: "/images/productos/set-runas.jpg", category: "Runas" },
  { id: "runas-viaje", name: "Runas de Viaje", description: "Bolsa de tela y guía breve de lectura", price: 540, imageUrl: "/images/productos/set-runas.jpg", category: "Runas" },
];

const prisma = new PrismaClient();

try {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { name: product.name, description: product.description, price: product.price, imageUrl: product.imageUrl, category: product.category },
      create: product,
    });
  }
  console.log(`Catálogo listo: ${products.length} productos en Pulseras, Collares, Veladoras y Runas.`);
} catch (error) {
  console.error("No fue posible sembrar el catálogo:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
