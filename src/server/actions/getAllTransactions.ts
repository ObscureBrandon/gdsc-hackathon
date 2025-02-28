"use server";

import { db } from "~/server/db/index";
import { transactions, bankAccounts, categories } from "~/server/db/schema";
import { eq, and, desc, or, asc, sql } from "drizzle-orm";
import { auth } from "~/server/auth";
import { TransactionWithDetails } from "./recentTransactions";

export type SortDirection = "asc" | "desc";
export type SortField = "date" | "amount" | "merchant";

export type TransactionsResult = {
  data: TransactionWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function getAllTransactions({
  page = 1,
  pageSize = 10,
  sortField = "date",
  sortDirection = "desc",
}: {
  page?: number;
  pageSize?: number;
  sortField?: SortField;
  sortDirection?: SortDirection;
}): Promise<TransactionsResult> {
  const session = await auth();
  if (!session?.user)
    return { data: [], total: 0, page, pageSize, pageCount: 0 };

  const userId = session.user.id;

  // Get user's bank account IDs
  const userAccounts = await db
    .select({ id: bankAccounts.id })
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, userId));

  const accountIds = userAccounts.map((account) => account.id);
  if (accountIds.length === 0) {
    return { data: [], total: 0, page, pageSize, pageCount: 0 };
  }

  // Calculate pagination values
  const offset = (page - 1) * pageSize;

  // Count total transactions for pagination
  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(transactions)
    .where(
      or(
        ...accountIds.map((id) => eq(transactions.senderAccountId, id)),
        ...accountIds.map((id) => eq(transactions.receiverAccountId, id)),
      ),
    );

  const total = Number(countResult[0]?.count || 0);
  const pageCount = Math.ceil(total / pageSize);

  // Define sorting
  let orderByField;
  switch (sortField) {
    case "date":
      orderByField = transactions.createdAt;
      break;
    case "amount":
      orderByField = transactions.amount;
      break;
    case "merchant":
      orderByField = transactions.merchantName;
      break;
    default:
      orderByField = transactions.createdAt;
  }

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
    .orderBy(sortDirection === "desc" ? desc(orderByField) : asc(orderByField))
    .offset(offset)
    .limit(pageSize);

  // Format transactions for display
  const formattedTransactions = transactionsResult.map((tx) => {
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

  return {
    data: formattedTransactions,
    total,
    page,
    pageSize,
    pageCount,
  };
}
