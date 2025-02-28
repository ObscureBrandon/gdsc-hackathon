"use server";

import { and, eq, sql } from "drizzle-orm";
import { auth } from "~/server/auth";
import { db } from "~/server/db/index";
import { bankAccounts, transactions, users } from "~/server/db/schema";

export type TransferParams = {
  amount: number;
  description?: string;
  senderAccountId: string;
  receiverAccountNumber: string;
  categoryId?: string; // Add categoryId parameter
};

export async function createTransfer(
  params: TransferParams,
): Promise<{ success: boolean; message: string; transactionId?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  const { amount, description, senderAccountId, receiverAccountNumber } =
    params;

  // Validate amount
  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than zero" };
  }

  // Check if sender account exists and belongs to the user
  const senderAccount = await db
    .select()
    .from(bankAccounts)
    .where(
      and(
        eq(bankAccounts.id, senderAccountId),
        eq(bankAccounts.userId, session.user.id),
      ),
    )
    .limit(1);

  if (senderAccount.length === 0 || !senderAccount[0]) {
    return { success: false, message: "Sender account not found" };
  }

  // Check if sender has enough balance
  if (Number(senderAccount[0].balance) < amount) {
    return { success: false, message: "Insufficient balance" };
  }

  // First find user by handle
  const receiverUser = await db
    .select()
    .from(users)
    .where(eq(users.handle, receiverAccountNumber))
    .limit(1);

  if (receiverUser.length === 0 || !receiverUser[0]) {
    return { success: false, message: "Recipient not found" };
  }

  // Find receiver account by user ID
  const receiverAccount = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, receiverUser[0].id))
    .limit(1);

  if (receiverAccount.length === 0 || !receiverAccount[0]) {
    return { success: false, message: "Recipient has no bank account" };
  }

  // Begin transaction
  try {
    const [transaction] = await db
      .insert(transactions)
      .values({
        type: "transfer",
        amount: amount.toString(),
        description:
          description ||
          `Transfer to ${receiverUser[0].name || receiverUser[0].handle}`,
        senderAccountId: senderAccountId,
        receiverAccountId: receiverAccount[0].id,
        status: "completed",
        merchantName: receiverUser[0].name || receiverUser[0].handle,
        categoryId: params.categoryId, // Add this line to include the category
      })
      .returning();

    if (!transaction) {
      return {
        success: false,
        message: "Transfer failed. Please try again later.",
      };
    }

    // Update sender balance
    await db
      .update(bankAccounts)
      .set({
        balance: sql`${bankAccounts.balance} - ${amount}`,
      })
      .where(eq(bankAccounts.id, senderAccountId));

    // Update receiver balance
    await db
      .update(bankAccounts)
      .set({
        balance: sql`${bankAccounts.balance} + ${amount}`,
      })
      .where(eq(bankAccounts.id, receiverAccount[0].id));

    return {
      success: true,
      message: "Transfer completed successfully",
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error("Transfer failed:", error);
    return {
      success: false,
      message: "Transfer failed. Please try again later.",
    };
  }
}
