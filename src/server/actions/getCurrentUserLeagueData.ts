import { eq } from "drizzle-orm";
import { and, gte, lt } from "drizzle-orm/sql";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { bankAccounts, transactions, users } from "~/server/db/schema";

export type UserMetrics = {
  handle: string;
  monthly_spending: number;
  monthly_savings: number;
  last_month_savings: number;
};

export async function getCurrentUserMetrics(): Promise<UserMetrics | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    );

    // Get current user with their bank account
    const userData = await db
      .select({
        handle: users.handle,
        bankAccountId: bankAccounts.id,
        balance: bankAccounts.balance,
      })
      .from(users)
      .leftJoin(bankAccounts, eq(bankAccounts.userId, users.id))
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userData[0] || !userData[0].bankAccountId) return null;

    // Get user's transactions for the current month
    const monthlyTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.senderAccountId, userData[0].bankAccountId),
          gte(transactions.createdAt, firstDayOfMonth),
          lt(transactions.createdAt, firstDayOfNextMonth),
        ),
      );

    // Calculate spending (withdrawals and payments)
    const monthlySpending = monthlyTransactions
      .filter((tx) => tx.type === "withdrawal" || tx.type === "payment")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Calculate income (deposits and refunds)
    const monthlyIncome = monthlyTransactions
      .filter((tx) => tx.type === "deposit" || tx.type === "refund")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Calculate savings
    const monthlySavings = monthlyIncome - monthlySpending;

    // Get current balance as last month's savings
    const lastMonthSavings = userData[0].balance
      ? Number(userData[0].balance)
      : 0;

    return {
      handle: userData[0].handle ?? "user",
      monthly_spending: monthlySpending,
      monthly_savings: monthlySavings,
      last_month_savings: lastMonthSavings,
    };
  } catch (error) {
    console.error("Error getting user metrics:", error);
    return null;
  }
}
