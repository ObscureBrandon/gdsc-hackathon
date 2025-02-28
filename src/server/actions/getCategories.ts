"use server";

import { db } from "~/server/db/index";
import { categories } from "~/server/db/schema";
import { auth } from "~/server/auth";

export async function getCategories() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color,
      })
      .from(categories)
      .orderBy(categories.name);

    return allCategories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw new Error("Failed to load categories");
  }
}
