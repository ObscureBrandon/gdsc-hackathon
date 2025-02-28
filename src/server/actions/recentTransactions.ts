"use server";

import { db } from "~/server/db/index";
import { transactions, bankAccounts, categories } from "~/server/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { auth } from "~/server/auth";

export type TransactionWithDetails = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  status: string;
  reference: string;
  createdAt: Date;
  merchantName: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  isOutgoing: boolean;
};

export async function getRecentTransactions(
  limit = 5,
): Promise<TransactionWithDetails[]> {
  const session = await auth();
  if (!session?.user) return [];

  const userId = session.user.id;

  // Get user's bank account IDs
  const userAccounts = await db
    .select({ id: bankAccounts.id })
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, userId));

  const accountIds = userAccounts.map((account) => account.id);
  if (accountIds.length === 0) return [];

  // Get transactions where user is either sender or receiver
  const transactionsResult = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      status: transactions.status,
      reference: transactions.reference,
      createdAt: transactions.createdAt,
      merchantName: transactions.merchantName,
      senderAccountId: transactions.senderAccountId,
      receiverAccountId: transactions.receiverAccountId,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      or(
        ...accountIds.map((id) => eq(transactions.senderAccountId, id)),
        ...accountIds.map((id) => eq(transactions.receiverAccountId, id)),
      ),
    )
    .orderBy(desc(transactions.createdAt))
    .limit(limit);

  // Format transactions for display
  return transactionsResult.map((tx) => {
    // Determine if transaction is outgoing (expense) or incoming (income)
    const isOutgoing = accountIds.includes(tx.senderAccountId || "");

    return {
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      description: tx.description,
      status: tx.status,
      reference: tx.reference,
      createdAt: new Date(tx.createdAt!),
      merchantName: tx.merchantName,
      categoryName: tx.categoryName,
      categoryIcon: tx.categoryIcon,
      isOutgoing,
    };
  });
}
