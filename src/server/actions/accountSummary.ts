"use server";

import { db } from "~/server/db/index";
import { transactions, bankAccounts, categories } from "~/server/db/schema";
import { eq, and, gte, sum, sql } from "drizzle-orm";
import { auth } from "~/server/auth";

export type MonthlyData = {
  name: string; // Month name
  total: number;
};

export type WeeklyData = {
  name: string; // Day name
  total: number;
};

export type ChartData = {
  monthly: MonthlyData[];
  weekly: WeeklyData[];
  savings: {
    name: string;
    value: number;
  }[];
};

export async function getAccountSummary(): Promise<ChartData | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  // Get user's bank account IDs
  const userAccounts = await db
    .select({ id: bankAccounts.id })
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, userId));

  const accountIds = userAccounts.map((account) => account.id);
  if (accountIds.length === 0) {
    return {
      monthly: [],
      weekly: [],
      savings: [],
    };
  }

  // Get last 7 months of data for monthly chart
  const monthlyData: MonthlyData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

    const monthStr = month.toISOString().split("T")[0];
    const monthEndStr = monthEnd.toISOString().split("T")[0];

    // Get expenses for this month
    const expensesResult = await db
      .select({
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(
        and(
          ...accountIds.map((id) => eq(transactions.senderAccountId, id)),
          sql`${transactions.createdAt} >= ${monthStr}`,
          sql`${transactions.createdAt} <= ${monthEndStr}`,
          eq(transactions.status, "completed"),
        ),
      );

    const monthName = month.toLocaleString("default", { month: "short" });
    const total = parseFloat(expensesResult[0]?.total || "0");

    monthlyData.push({
      name: monthName,
      total,
    });
  }

  // Get last 7 days of data for weekly chart
  const weeklyData: WeeklyData[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);

    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayStr = day.toISOString().split("T")[0];
    const nextDayStr = nextDay.toISOString().split("T")[0];

    // Get expenses for this day
    const expensesResult = await db
      .select({
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(
        and(
          ...accountIds.map((id) => eq(transactions.senderAccountId, id)),
          sql`${transactions.createdAt} >= ${dayStr}`,
          sql`${transactions.createdAt} < ${nextDayStr}`,
          eq(transactions.status, "completed"),
        ),
      );

    const dayName = dayNames[day.getDay()];
    const total = parseFloat(expensesResult[0]?.total || "0");

    weeklyData.push({
      name: dayName!,
      total,
    });
  }

  // Get savings data (weekly for the past month)
  const savingsData = [];
  const weeksAgo = 4;

  for (let i = weeksAgo - 1; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - (i * 7 + 6));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    // Get income for this week
    const incomeResult = await db
      .select({
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(
        and(
          ...accountIds.map((id) => eq(transactions.receiverAccountId, id)),
          sql`${transactions.createdAt} >= ${weekStartStr}`,
          sql`${transactions.createdAt} <= ${weekEndStr}`,
          eq(transactions.status, "completed"),
        ),
      );

    // Get expenses for this week
    const expensesResult = await db
      .select({
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(
        and(
          ...accountIds.map((id) => eq(transactions.senderAccountId, id)),
          sql`${transactions.createdAt} >= ${weekStartStr}`,
          sql`${transactions.createdAt} <= ${weekEndStr}`,
          eq(transactions.status, "completed"),
        ),
      );

    const income = parseFloat(incomeResult[0]?.total || "0");
    const expenses = parseFloat(expensesResult[0]?.total || "0");
    const savings = income - expenses;

    savingsData.push({
      name: `Week ${weeksAgo - i}`,
      value: savings,
    });
  }

  return {
    monthly: monthlyData,
    weekly: weeklyData,
    savings: savingsData,
  };
}
