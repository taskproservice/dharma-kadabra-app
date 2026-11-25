/**
 * Seed del catálogo REAL de Holistic Store — expansión de la tienda.
 *
 * Carga las 20 piezas artesanales de Dharma Kadabra:
 *   - 10 pulseras (categoría "Pulseras")
 *   - 10 cadenas y collares (categoría "Cadenas")
 * con sus datos comerciales completos. Esas son las únicas piezas publicadas
 * y visibles en la tienda pública después de correr este script.
 *
 * Uso (con DATABASE_URL configurada):
 *   node scripts/seed-products.mjs
 *
 * Requiere el cliente Prisma generado (`npm run build` o `npx prisma generate`).
 * Las imágenes viven en /public/images/products/{pulsera,cadena}-N.jpg y se
 * referencian como rutas públicas ("/images/products/{pulsera,cadena}-N.jpg").
 *
 * Idempotente: usa `upsert`, así que puede ejecutarse las veces que haga falta.
 *
 * Limpieza de productos de prueba:
 *   Los productos que NO forman parte del catálogo real (las piezas de
 *   muestra heredadas de Runas/Piedras/Collares/Veladoras, etc.) NO se borran —
 *   se despublican y se ocultan (published: false, isVisible: false) para no
 *   romper historiales de compra ni analíticas. Si alguna vez quieres
 *   borrarlos de forma definitiva, hazlo desde el panel de inventario.
 */
import { PrismaClient } from "../src/generated/prisma/index.js";

/** Monedas y disponibilidades válidas para la tienda pública. */
const CURRENCIES = new Set(["MXN", "USD"]);
const AVAILABILITIES = new Set(["available", "out_of_stock"]);

/** Normaliza una fila: moneda/availability válidas y booleanos reales. */
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
    isVisible: product.isVisible !== false,
    profitMargin: price > 0 ? Math.round(((price - cost) / price) * 1000) / 10 : 0,
  };
}

/**
 * Las 10 pulseras reales del lanzamiento.
 * `slug` se persiste como `id` del producto (la tabla Product no tiene
 * columna slug; el id legible funciona como slug en toda la app).
 */
const products = [
  {
    slug: "pulsera-ojo-de-tigre",
    name: "Pulsera de Ojo de Tigre",
    description: "Piedra volcánica dorada con destellos ámbar.\nProtección, valor y claridad en cada paso de tu camino.",
    price: 450,
    cost: 180,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 6,
    imageUrl: "/images/products/pulsera-1.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-ojo-de-tigre-turquesa",
    name: "Pulsera de Ojo de Tigre con Turquesa",
    description: "El ánimo del tigre unido a la voz serena de la turquesa.\nComunicación con el corazón y temple para quien habla con verdad.",
    price: 520,
    cost: 210,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/pulsera-2.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-ojo-de-tigre-coral",
    name: "Pulsera de Ojo de Tigre con Coral Rojo",
    description: "Vitalidad ardiente entre cuentas doradas.\nEl coral despierta la sangre; el tigre, la voluntad.",
    price: 540,
    cost: 215,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/pulsera-3.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-ojo-de-tigre-lapislazuli",
    name: "Pulsera de Ojo de Tigre con Lapislázuli",
    description: "Verdad interior y cielo profundo en una misma pulsera.\nIntuición, palabra y soberanía para quien la porta.",
    price: 560,
    cost: 225,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/pulsera-4.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-ojo-de-tigre-cuarzo",
    name: "Pulsera de Ojo de Tigre con Cuarzo Champagne",
    description: "Luz suave y claridad absoluta en cada cuenta.\nEl cuarzo amplifica la intención del tigre y ordena la mente.",
    price: 580,
    cost: 230,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 7,
    imageUrl: "/images/products/pulsera-5.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-ojo-de-tigre-pluma",
    name: "Pulsera de Ojo de Tigre con Pluma de Plata",
    description: "La pluma guía; el tigre protege.\nUn camino ligero, firme y siempre acompañado.",
    price: 620,
    cost: 250,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 4,
    imageUrl: "/images/products/pulsera-6.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-ojo-de-tigre-san-benito",
    name: "Pulsera de Ojo de Tigre con Medalla de San Benito",
    description: "Fe ancestral y piedra de poder en un solo lazo.\nUn escudo dorado contra la sombra y la envidia.",
    price: 650,
    cost: 260,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 4,
    imageUrl: "/images/products/pulsera-7.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-triple-proteccion",
    name: "Pulsera de Protección Triple",
    description: "Ojo de tigre, ágata roja y ónix en una sola trama.\nTres guardianes —tierra, fuego y sombra— para blindar tu energía.",
    price: 680,
    cost: 270,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 3,
    imageUrl: "/images/products/pulsera-8.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-roja-nudo-celta",
    name: "Pulsera Roja del Nudo Celta",
    description: "El hilo rojo ata la fortuna a tu muñeca.\nNudo eterno de la suerte, la salud y el amor.",
    price: 480,
    cost: 190,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 8,
    imageUrl: "/images/products/pulsera-9.jpg",
    category: "Pulseras",
    isVisible: true,
  },
  {
    slug: "pulsera-ojo-de-tigre-citrino",
    name: "Pulsera de Ojo de Tigre con Citrino",
    description: "Abundancia que amanece entre cuentas doradas.\nCitrino y tigre atraen prosperidad, sol interior y confianza creadora.",
    price: 590,
    cost: 235,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/pulsera-10.jpg",
    category: "Pulseras",
    isVisible: true,
  },

  /* ------------------------------------------------------------------------ */
  /*  Categoría: Cadenas (10 piezas reales de expansión)                      */
  /* ------------------------------------------------------------------------ */
  {
    slug: "collar-cuarzo-esmerilado-om",
    name: "Collar de Cuarzo Esmerilado y Om de Plata",
    description: "Cuentas de cuarzo esmerilado consagradas con el mantra Om en plata antigua.\nSerena la mente, purifica el aura y ancla la vibración de paz en el pecho.",
    price: 680,
    cost: 270,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-1.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "mala-tibetano-granate-carmesi",
    name: "Mala Tibetano de Granate y Borla Carmesí",
    description: "Cuentas de granate profundo con sellos tibetanos en oro y borla ritual carmesí.\nEnciende la fuerza vital, custodia tus meditaciones y disipa toda densidad.",
    price: 790,
    cost: 315,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-2.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "collar-amatista",
    name: "Collar de Amatista",
    description: "Punta natural de amatista engarzada en cobre sobre semillas y piedras de tierra.\nTransmuta la energía densa, despierta la intuición y protege tu campo espiritual.",
    price: 820,
    cost: 330,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-3.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "collar-mala-loto-sagrado",
    name: "Collar Mala del Loto Sagrado",
    description: "Rosario oriental de cuentas oscuras con cuenta gurú de turquesa y coral.\nGuía la respiración consciente y sella un círculo de calma alrededor del alma.",
    price: 760,
    cost: 305,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-4.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "cadena-dorada-cuarzo-cristal",
    name: "Cadena Dorada con Punta de Cuarzo Cristal",
    description: "Cristal maestro de cuarzo transparente suspendido entre nácar blanco y cuentas doradas.\nAmplifica tus intenciones, ilumina el corazón y eleva tu frecuencia vital.",
    price: 850,
    cost: 340,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-5.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "collar-turmalina-negra-perla",
    name: "Collar de Turmalina Negra y Perla Solar",
    description: "Turmalina negra en bruto bañada en oro junto a perla, lava volcánica y ojo de tigre.\nEscudo supremo de arraigo y protección contra envidias y cargas ajenas.",
    price: 880,
    cost: 350,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-6.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "collar-cuarzo-medallon-om",
    name: "Collar de Cuarzo Maestro y Medallón Om",
    description: "Esferas de cristal de roca tejidas en hilo rojo con medallón tibetano de turquesa.\nArmoniza los centros de energía y atrae claridad luminosa a tu propósito.",
    price: 780,
    cost: 310,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-7.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "collar-sodalita-real-sandalo",
    name: "Collar de Sodalita Real y Sándalo",
    description: "Obelisco natural de sodalita azul entre madera sagrada y piedras de sabiduría.\nAbre la visión interior, templa la palabra y conecta con la verdad profunda.",
    price: 840,
    cost: 335,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-8.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "cadena-luz-lunar-cuarzo",
    name: "Cadena de Luz Lunar con Cuarzo Blanco",
    description: "Destellos facetados y cuentas blancas que abrazan una punta pura de cuarzo.\nRenueva la serenidad emocional y envuelve tu presencia en luz cristalina.",
    price: 720,
    cost: 290,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-9.jpg",
    category: "Cadenas",
    isVisible: true,
  },
  {
    slug: "collar-ojo-de-tigre-san-benito",
    name: "Collar de Ojo de Tigre y San Benito",
    description: "Cuentas de ojo de tigre y destellos dorados coronados por la medalla de San Benito.\nTalismán consagrado de custodia espiritual, firmeza y bendición en tu camino.",
    price: 650,
    cost: 260,
    currency: "MXN",
    availability: "available",
    published: true,
    stock: 5,
    imageUrl: "/images/products/cadena-10.jpg",
    category: "Cadenas",
    isVisible: true,
  },
];

const prisma = new PrismaClient();

try {
  const braceletsCount = products.filter((p) => p.category === "Pulseras").length;
  const necklacesCount = products.filter((p) => p.category === "Cadenas").length;
  if (products.length !== 20 || braceletsCount !== 10 || necklacesCount !== 10) {
    throw new Error(
      `El catálogo debe tener exactamente 20 piezas (10 Pulseras + 10 Cadenas); actual: ${products.length} (${braceletsCount} Pulseras, ${necklacesCount} Cadenas).`,
    );
  }

  const seeded = products.map((product) => {
    const { slug, ...rest } = product;
    return normalize({ id: slug, slug, ...rest });
  });

  // 1) Upsert de las 20 piezas reales (10 pulseras + 10 cadenas).
  for (const product of seeded) {
    const { slug, ...data } = product;
    await prisma.product.upsert({ where: { id: product.id }, update: data, create: data });
  }

  // 2) Limpieza (no destructiva): despublica y oculta cualquier producto
  //    que no sea del catálogo real, para que la tienda no muestre piezas
  //    de muestra. No se borra nada: las compras y métricas históricas se
  //    conservan.
  const realIds = seeded.map((product) => product.id);
  const hidden = await prisma.product.updateMany({
    where: { id: { notIn: realIds }, OR: [{ published: true }, { isVisible: true }] },
    data: { published: false, isVisible: false },
  });

  const published = await prisma.product.count({ where: { published: true, isVisible: true } });
  console.log(
    `Catálogo real cargado: ${seeded.length} piezas publicadas y visibles (${braceletsCount} pulseras y ${necklacesCount} cadenas).`,
  );
  if (hidden.count > 0) {
    console.log(`Piezas de prueba despublicadas y ocultadas (no borradas): ${hidden.count}.`);
  }
  console.log(`Total visible en la tienda ahora: ${published} pieza(s).`);
} catch (error) {
  console.error("No fue posible sembrar el catálogo:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
