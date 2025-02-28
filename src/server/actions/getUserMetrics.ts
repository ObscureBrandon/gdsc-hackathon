import { eq } from "drizzle-orm";
import { and, gte, lt, sql } from "drizzle-orm/sql";
import { db } from "~/server/db";
import { bankAccounts, transactions, users } from "~/server/db/schema";

export type UserMetrics = {
  handle: string;
  monthly_spending: number;
  monthly_savings: number;
  last_month_savings: number;
};

export async function getUserMetrics(): Promise<UserMetrics[]> {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );
  const firstDayOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  // Get all users with their transactions and bank accounts
  const usersWithData = await db
    .select({
      id: users.id,
      handle: users.handle,
      bankAccountId: bankAccounts.id,
      balance: bankAccounts.balance,
    })
    .from(users)
    .leftJoin(bankAccounts, eq(bankAccounts.userId, users.id))
    .where(sql`${users.handle} IS NOT NULL`);

  // Get all transactions for the current month
  const monthlyTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        gte(transactions.createdAt, firstDayOfMonth),
        lt(transactions.createdAt, firstDayOfNextMonth),
      ),
    );

  // Process data for each user
  return usersWithData.map((user) => {
    // Filter transactions for this user's bank account
    const userTransactions = monthlyTransactions.filter(
      (tx) => tx.senderAccountId === user.bankAccountId,
    );

    // Calculate spending (withdrawals and payments)
    const monthlySpending = userTransactions
      .filter((tx) => tx.type === "withdrawal" || tx.type === "payment")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Calculate income (deposits and refunds)
    const monthlyIncome = userTransactions
      .filter((tx) => tx.type === "deposit" || tx.type === "refund")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Calculate savings
    const monthlySavings = monthlyIncome - monthlySpending;

    // Get current balance as last month's savings
    const lastMonthSavings = user.balance ? Number(user.balance) : 0;

    return {
      handle: user.handle!,
      monthly_spending: monthlySpending,
      monthly_savings: 20000,
      last_month_savings: lastMonthSavings,
    };
  });
}
