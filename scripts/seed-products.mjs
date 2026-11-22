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
 *
 * Idempotente: usa `upsert`, así que puede ejecutarse las veces que haga falta
 * (deploy, restauración de datos, corrección del catálogo).
 */
import { PrismaClient } from "../src/generated/prisma/index.js";

/**
 * Las 4 categorías de la tienda pública. El seed garantiza al menos una pieza
 * publicada (`published: true`) con `currency` y `availability` válidos en
 * cada una; sin esto la tienda responde "No pudimos cargar …".
 */
const PUBLIC_CATEGORIES = ["Pulseras", "Cadenas", "Runas", "Piedras"];
const CURRENCIES = new Set(["MXN", "USD"]);
const AVAILABILITIES = new Set(["available", "out_of_stock"]);

/** Normaliza una fila: moneda/availability válidas y `published` booleano. */
function normalize(product) {
  const currency = CURRENCIES.has(product.currency) ? product.currency : "MXN";
  const stock = Number.isFinite(product.stock) ? product.stock : 0;
  const availability =
    stock <= 0 ? "out_of_stock" : AVAILABILITIES.has(product.availability) ? product.availability : "available";
  const price = Number.isFinite(product.price) && product.price > 0 ? product.price : 0;
  const cost = Number.isFinite(product.cost) && product.cost >= 0 ? product.cost : 0;
  return {
    ...product,
    price,
    cost,
    currency,
    stock,
    availability,
    published: product.published !== false,
    profitMargin: price > 0 ? Math.round(((price - cost) / price) * 1000) / 10 : 0,
  };
}

const products = [
  // Pulseras
  { id: "pulsera-obsidiana", name: "Pulsera de Obsidiana", description: "Obsidiana negra · protección y arraigo", price: 450, cost: 180, currency: "MXN", availability: "available", published: true, stock: 12, imageUrl: "/images/productos/talisman-solar.jpg", category: "Pulseras" },
  { id: "pulsera-cuarzo", name: "Pulsera de Cuarzo Claro", description: "Cuarzo pulido · claridad y enfoque", price: 380, cost: 150, currency: "MXN", availability: "available", published: true, stock: 8, imageUrl: "/images/productos/cuarzo-claro.jpg", category: "Pulseras" },
  { id: "pulsera-ambar", name: "Pulsera de Ámbar", description: "Ámbar cálido · vitalidad y calma", price: 520, cost: 230, currency: "MXN", availability: "out_of_stock", published: true, stock: 0, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Pulseras" },
  // Cadenas
  { id: "cadena-talisman-solar", name: "Cadena Talismán Solar", description: "Medallón de sol en dorado con ámbar", price: 880, cost: 390, currency: "MXN", availability: "available", published: true, stock: 6, imageUrl: "/images/productos/talisman-solar.jpg", category: "Cadenas" },
  { id: "cadena-amuleto-lunar", name: "Cadena Amuleto Lunar", description: "Luna creciente con lapislázuli", price: 28, cost: 11, currency: "USD", availability: "available", published: true, stock: 4, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Cadenas" },
  { id: "cadena-luna-plata", name: "Cadena Luna de Plata", description: "Luna creciente en plata con cuarzo blanco", price: 690, cost: 290, currency: "MXN", availability: "available", published: true, stock: 7, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Cadenas" },
  { id: "cadena-sello-sol", name: "Cadena Sello Solar", description: "Sol grabado a mano · vitalidad y confianza", price: 820, cost: 350, currency: "MXN", availability: "available", published: true, stock: 5, imageUrl: "/images/productos/talisman-solar.jpg", category: "Cadenas" },
  // Collares (heredada, POS)
  { id: "collar-talisman-solar", name: "Collar Talismán Solar", description: "Medallón de sol en dorado con ámbar", price: 880, cost: 390, currency: "MXN", availability: "available", published: true, stock: 5, imageUrl: "/images/productos/talisman-solar.jpg", category: "Collares" },
  { id: "collar-amuleto-lunar", name: "Collar Amuleto Lunar", description: "Luna creciente con lapislázuli", price: 960, cost: 420, currency: "MXN", availability: "available", published: false, stock: 3, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Collares" },
  // Veladoras (heredada, POS)
  { id: "veladora-intencion", name: "Veladora de Intención", description: "Cera de soya, hierbas y dije dorado", price: 420, cost: 170, currency: "MXN", availability: "available", published: false, stock: 10, imageUrl: "/images/productos/vela-intencion.jpg", category: "Veladoras" },
  { id: "veladora-altar", name: "Veladora de Altar", description: "Para rituales de apertura y protección", price: 350, cost: 140, currency: "MXN", availability: "available", published: false, stock: 2, imageUrl: "/images/productos/vela-intencion.jpg", category: "Veladoras" },
  // Runas
  { id: "set-runas-madera", name: "Set de Runas de Madera", description: "Madera tallada a mano · 24 símbolos del Futhark", price: 720, cost: 300, currency: "MXN", availability: "available", published: true, stock: 7, imageUrl: "/images/productos/set-runas.jpg", category: "Runas" },
  { id: "runas-viaje", name: "Runas de Viaje", description: "Bolsa de tela y guía breve de lectura", price: 540, cost: 210, currency: "MXN", availability: "available", published: true, stock: 9, imageUrl: "/images/productos/set-runas.jpg", category: "Runas" },
  { id: "runas-lino", name: "Runas sobre Lino", description: "Set completo con bolsa de lino y libreta de lectura", price: 780, cost: 320, currency: "MXN", availability: "available", published: true, stock: 6, imageUrl: "/images/productos/set-runas.jpg", category: "Runas" },
  { id: "runas-violeta", name: "Runas Violeta Sagrada", description: "Piedra violeta pulida · intuición y protección", price: 640, cost: 250, currency: "MXN", availability: "available", published: true, stock: 4, imageUrl: "/images/productos/set-runas.jpg", category: "Runas" },
  // Piedras
  { id: "piedra-cuarzo-claro", name: "Cuarzo Claro", description: "Punta pulida · claridad mental y enfoque", price: 350, cost: 120, currency: "MXN", availability: "available", published: true, stock: 15, imageUrl: "/images/productos/cuarzo-claro.jpg", category: "Piedras" },
  { id: "piedra-obsidiana", name: "Obsidiana Guardián", description: "Obsidiana negra pulida · arraigo y escudo", price: 290, cost: 95, currency: "MXN", availability: "available", published: true, stock: 18, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Piedras" },
  { id: "piedra-amatista", name: "Amatista Guardián", description: "Drusa natural · calma y protección del hogar", price: 32, cost: 13, currency: "USD", availability: "available", published: true, stock: 5, imageUrl: "/images/productos/amuleto-lunar.jpg", category: "Piedras" },
];

const prisma = new PrismaClient();

/** Piezas extra para cualquier categoría pública que quede vacía. */
const FALLBACK_BY_CATEGORY = {
  Pulseras: { name: "Pulsera de Intención", description: "Hilo dorado con cuarzo · intención y presencia", price: 420, cost: 170, imageUrl: "/images/productos/cuarzo-claro.jpg" },
  Cadenas: { name: "Cadena de Propósito", description: "Eslabón fino con medalla grabada · claridad", price: 760, cost: 330, imageUrl: "/images/productos/talisman-solar.jpg" },
  Runas: { name: "Runas del Camino", description: "Set de madera natural · guía para tu lectura", price: 640, cost: 260, imageUrl: "/images/productos/set-runas.jpg" },
  Piedras: { name: "Piedra Guardiana", description: "Cuarzo natural · protección del hogar", price: 320, cost: 110, imageUrl: "/images/productos/amuleto-lunar.jpg" },
};

try {
  const seeded = products.map(normalize);

  for (const product of seeded) {
    const { id, ...data } = product;
    await prisma.product.upsert({ where: { id }, update: data, create: product });
  }

  // Blindaje: cada categoría pública debe tener al menos una pieza publicada.
  for (const category of PUBLIC_CATEGORIES) {
    const published = await prisma.product.count({ where: { category, published: true } });
    if (published > 0) continue;
    const fallback = normalize({
      id: `seed-${category.toLowerCase()}`,
      ...FALLBACK_BY_CATEGORY[category],
      currency: "MXN",
      availability: "available",
      published: true,
      stock: 5,
      category,
    });
    const { id, ...data } = fallback;
    await prisma.product.upsert({ where: { id }, update: data, create: fallback });
    console.log(`  · Pieza de respaldo creada para ${category}`);
  }

  const categories = [...new Set(seeded.map((product) => product.category))];
  const publishedTotal = await prisma.product.count({ where: { published: true } });
  console.log(
    `Catálogo listo: ${seeded.length} productos en ${categories.join(", ")} (${publishedTotal} publicados en la tienda).`,
  );
} catch (error) {
  console.error("No fue posible sembrar el catálogo:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
