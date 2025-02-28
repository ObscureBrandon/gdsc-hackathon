import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { users, bankAccounts } from "~/server/db/schema";
import { sql } from "drizzle-orm";

const handleSchema = z
  .string()
  .min(3, "Handle must be at least 3 characters")
  .max(20, "Handle must be less than 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Handle can only contain letters, numbers, - and _",
  );

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { handle } = await req.json();

    // Validate handle
    handleSchema.parse(handle);

    // Check if handle is already taken
    const existingUser = await db.query.users.findFirst({
      where: eq(users.handle, handle),
    });

    if (existingUser) {
      return Response.json(
        { error: "This handle is already taken" },
        { status: 400 },
      );
    }

    // Update user with new handle
    await db.update(users).set({ handle }).where(eq(users.id, session.user.id));

    // Check if the user has a bank account already
    const existingAccount = await db
      .select()
      .from(bankAccounts)
      .where(sql`user_id = ${session.user.id}`)
      .limit(1);

    // If no bank account exists, create one
    if (existingAccount.length === 0) {
      const accountData = {
        userId: session.user.id,
        accountNumber: generateUniqueAccountNumber(),
        accountName: "Main Checking",
        balance: "5000.00",
      };

      await db.insert(bankAccounts).values(accountData);
    }

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.errors[0]?.message || "Invalid handle" },
        { status: 400 },
      );
    }
    return Response.json({ error: "Failed to update handle" }, { status: 500 });
  }
}

// Helper function to generate a unique bank account number
function generateUniqueAccountNumber(): string {
  // Generate a 10-digit account number
  const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
  return randomNum.toString();
}
