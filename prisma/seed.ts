import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { products } from "../lib/data/products";
import { collaborators } from "../lib/data/collaborators";

/**
 * Script de sembrado de producción para Dharma Kadabra.
 * Inserta usuario administrador, colaboradores iniciales y catálogo de productos.
 */
export async function seed() {
  console.log("🌱 Iniciando sembrado (seed) de Dharma Kadabra en base de datos...");

  // 1. Usuario Administrador (Paola Hernández)
  const hashedPassword = await bcrypt.hash("dharma2026", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "paola@dharmakadabra.com" },
    update: {
      name: "Paola Hernández",
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Paola Hernández",
      email: "paola@dharmakadabra.com",
      password: hashedPassword,
      role: "ADMIN",
      imageUrl: "/images/equipo/paola-hernandez.jpg",
    },
  });
  console.log(`✓ Administradora creada: ${adminUser.name} (${adminUser.email})`);

  // Usuario Admin Secundario
  const adminSecondary = await prisma.user.upsert({
    where: { email: "admin@dharmakadabra.com" },
    update: { password: hashedPassword },
    create: {
      name: "Administrador Dharma",
      email: "admin@dharmakadabra.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`✓ Administrador secundario: ${adminSecondary.email}`);

  // 2. Colaboradores iniciales
  for (const c of collaborators) {
    const collaborator = await prisma.collaborator.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        specialty: c.specialty,
        bio: c.bio,
        imageUrl: c.photoUrl,
        email: c.email,
        phone: "+52 55 1234 5678",
        active: true,
      },
      create: {
        id: c.id,
        name: c.name,
        role: "Colaboradora",
        specialty: c.specialty,
        bio: c.bio,
        imageUrl: c.photoUrl,
        email: c.email,
        phone: "+52 55 1234 5678",
        active: true,
      },
    });
    console.log(`✓ Colaborador registrado: ${collaborator.name} (${collaborator.specialty})`);
  }

  // 3. Catálogo de productos base
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        stock: 15,
        featured: true,
      },
      create: {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        stock: 15,
        featured: true,
      },
    });
    console.log(`✓ Producto registrado: ${product.name} - $${product.price} USD`);
  }

  console.log("✨ ¡Sembrado completado con éxito!");
}

// Ejecutar si se llama directamente
if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  seed()
    .then(() => {
      console.log("Listo.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error durante el seed:", err);
      process.exit(1);
    });
}
