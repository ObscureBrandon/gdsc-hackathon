"use server";

import { db } from "~/server/db/index";
import { users } from "~/server/db/schema";
import { auth } from "~/server/auth";
import { ne } from "drizzle-orm";

export async function getAllUsers() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const allUsers = await db
      .select({
        id: users.id,
        handle: users.handle,
        name: users.name,
      })
      .from(users)
      .where(ne(users.id, session.user.id)) // Exclude current user
      .orderBy(users.name);

    return allUsers;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to load users");
  }
}
