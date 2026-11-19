"use server";

import { revalidatePath } from "next/cache";
import { prisma, type ProductRecord } from "../prisma";

export async function getProducts(): Promise<ProductRecord[]> {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error al obtener productos de la base de datos:", error);
    return [];
  }
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock?: number;
  featured?: boolean;
}): Promise<ProductRecord> {
  const newProduct = await prisma.product.create({
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl,
      stock: data.stock ?? 10,
      featured: data.featured ?? false,
    },
  });

  revalidatePath("/");
  return newProduct;
}
