"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { transactions, bankAccounts } from "~/server/db/schema";
import { sql } from "drizzle-orm";
import { desc, eq, gte, lte } from "drizzle-orm";

export type ChartDataPoint = {
  date: string;
  income: number;
  expense: number;
  balance: number;
};

export async function getFinancialChartData(
  days: number = 365,
): Promise<ChartDataPoint[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const userId = session.user.id;

    // Get user's bank account
    const userAccount = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, userId))
      .limit(1);

    if (!userAccount.length || !userAccount[0]) {
      return [];
    }

    const accountId = userAccount[0].id;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Fetch all transactions in the date range
    const allTransactions = await db
      .select({
        createdAt: transactions.createdAt,
        amount: transactions.amount,
        type: transactions.type,
        senderAccountId: transactions.senderAccountId,
        receiverAccountId: transactions.receiverAccountId,
      })
      .from(transactions)
      .where(
        sql`(sender_account_id = ${accountId} OR receiver_account_id = ${accountId}) AND 
            created_at >= ${startDate.toISOString()} AND 
            created_at <= ${endDate.toISOString()}`,
      )
      .orderBy(transactions.createdAt);

    // Get account's current balance
    const currentBalance = parseFloat(userAccount[0].balance.toString());

    // Calculate how much income/expense happened in the period to work backward to starting balance
    let netChangeInPeriod = 0;
    for (const tx of allTransactions) {
      if (tx.senderAccountId === accountId) {
        // Money leaving account (expense)
        netChangeInPeriod -= parseFloat(tx.amount.toString());
      }
      if (tx.receiverAccountId === accountId) {
        // Money entering account (income)
        netChangeInPeriod += parseFloat(tx.amount.toString());
      }
    }

    // Starting balance = current balance - net change
    let startingBalance = currentBalance - netChangeInPeriod;

    // Create a map to hold daily transactions
    const dailyData = new Map<string, { income: number; expense: number }>();

    // Initialize with all days in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      dailyData.set(dateKey!, { income: 0, expense: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate transactions by date
    for (const tx of allTransactions) {
      if (!tx.createdAt) continue;

      const dateKey = new Date(tx.createdAt).toISOString().split("T")[0];
      const amount = parseFloat(tx.amount.toString());

      let dayData = dailyData.get(dateKey!) || { income: 0, expense: 0 };

      if (tx.senderAccountId === accountId) {
        // Money leaving the account
        dayData.expense += amount;
      }
      if (tx.receiverAccountId === accountId) {
        // Money coming into the account
        dayData.income += amount;
      }

      dailyData.set(dateKey!, dayData);
    }

    // Convert to chart data points with running balance
    const result: ChartDataPoint[] = [];
    let runningBalance = startingBalance;

    // Convert Map to sorted array
    const sortedDates = Array.from(dailyData.keys()).sort();

    for (const dateKey of sortedDates) {
      const dayData = dailyData.get(dateKey);
      if (!dayData) continue;

      runningBalance += dayData.income - dayData.expense;

      result.push({
        date: dateKey,
        income: Math.round(dayData.income * 100) / 100,
        expense: Math.round(dayData.expense * 100) / 100,
        balance: Math.round(runningBalance * 100) / 100,
      });
    }

    return result;
  } catch (error) {
    console.error("Error getting chart data:", error);
    return [];
  }
}
