/* "use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import {
  bankAccounts,
  transactions as transactionsTable,
} from "~/server/db/schema";
import { auth } from "~/server/auth";
import { and, eq } from "drizzle-orm";

// Send money to another user
export async function sendMoney(
  receiverHandle: string,
  amount: number,
  description?: string,
) {
  try {
    // Validate amount
    if (amount <= 0) {
      return { success: false, message: "Amount must be greater than 0" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Get sender's account
      const senderAccount = await tx
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.userId, session.user.id))
        .execute();

      if (!senderAccount[0]) {
        return { success: false, message: "Sender account not found" };
      }

      // Check if sender has enough balance
      if (senderAccount[0].balance < amount) {
        return { success: false, message: "Insufficient balance" };
      }

      // Get receiver's account by handle
      const users = await tx.query.users.findMany({
        where: (users) => eq(users.handle, receiverHandle),
        with: {
          bankAccount: true,
        },
      });

      if (!users[0]) {
        return { success: false, message: "Receiver account not found" };
      }

      const receiverAccount = users[0].bankAccount;

      // Update balances
      await tx
        .update(bankAccounts)
        .set({ balance: senderAccount[0].balance - amount })
        .where(eq(bankAccounts.id, senderAccount[0].id));

      await tx
        .update(bankAccounts)
        .set({ balance: receiverAccount.balance + amount })
        .where(eq(bankAccounts.id, receiverAccount.id));

      // Create transaction record
      await tx.insert(transactionsTable).values({
        type: "transfer",
        amount,
        description: description || `Transfer to ${receiverHandle}`,
        senderAccountId: senderAccount[0].id,
        receiverAccountId: receiverAccount.id,
        status: "completed",
        merchantName: `Transfer to ${receiverHandle}`,
      });

      revalidatePath("/dashboard");
      return { success: true, message: "Money sent successfully" };
    });
  } catch (error) {
    console.error("Error sending money:", error);
    return { success: false, message: "Failed to send money" };
  }
}

// Deposit money (simulate deposit to user's account)
export async function depositMoney(amount: number, description?: string) {
  try {
    // Validate amount
    if (amount <= 0) {
      return { success: false, message: "Amount must be greater than 0" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Get user's account
      const userAccount = await tx
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.userId, session.user.id))
        .execute();

      if (!userAccount[0]) {
        return { success: false, message: "User account not found" };
      }

      // Update balance
      await tx
        .update(bankAccounts)
        .set({ balance: userAccount[0].balance + amount })
        .where(eq(bankAccounts.id, userAccount[0].id));

      // Create transaction record
      await tx.insert(transactionsTable).values({
        type: "deposit",
        amount,
        description: description || "Deposit to account",
        receiverAccountId: userAccount[0].id,
        status: "completed",
        merchantName: "League Wallet Deposit",
      });

      revalidatePath("/dashboard");
      return { success: true, message: "Money deposited successfully" };
    });
  } catch (error) {
    console.error("Error depositing money:", error);
    return { success: false, message: "Failed to deposit money" };
  }
}

// Helper function to get all user handles (for demo purposes)
export async function getAllUserHandles() {
  try {
    const users = await db.query.users.findMany({
      columns: {
        handle: true,
        id: true,
        name: true,
      },
      with: {
        bankAccount: {
          columns: {
            id: true,
          },
        },
      },
    });

    // Only return users that have bank accounts
    return users
      .filter((user) => user.bankAccount && user.handle)
      .map((user) => ({
        handle: user.handle!,
        name: user.name || user.handle,
      }));
  } catch (error) {
    console.error("Error fetching user handles:", error);
    return [];
  }
}
 */