import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { bankAccounts, categories, transactions } from "~/server/db/schema";

export type FinancialSummary = {
  currentBalance: number;
  monthlyStats: {
    income: number;
    expenses: number;
    savings: number;
    largestExpense: number;
    mostFrequentExpenseCategory: string | null;
    transactionCount: number;
  };
  trends: {
    averageTransactionSize: number;
    savingsRate: number; // Savings as percentage of income
    expenseBreakdown: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    monthlyTotals: {
      month: string;
      income: number;
      expenses: number;
      savings: number;
    }[];
    categoryTrends: {
      category: string;
      values: {
        month: string;
        amount: number;
      }[];
    }[];
  };
  riskMetrics: {
    largeExpenses: number; // Number of expenses > 20% of monthly income
    daysSinceLastIncome: number;
    balanceVolatility: number; // Standard deviation of daily balances
  };
};

export async function getUserFinancialSummary(
  userId: string,
): Promise<FinancialSummary | null> {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  try {
    // Get user's bank account
    const bankAccount = await db.query.bankAccounts.findFirst({
      where: eq(bankAccounts.userId, userId),
    });

    if (!bankAccount) return null;

    // Get monthly transactions with their categories
    const monthlyTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        createdAt: transactions.createdAt,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.senderAccountId, bankAccount.id),
          gte(transactions.createdAt, firstDayOfMonth),
          lt(transactions.createdAt, firstDayOfNextMonth),
        ),
      );

    // Calculate monthly stats
    const income = monthlyTransactions
      .filter((tx) => tx.type === "deposit" || tx.type === "refund")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const expenses = monthlyTransactions
      .filter((tx) => tx.type === "withdrawal" || tx.type === "payment")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Calculate category breakdown
    const categoryTotals = monthlyTransactions.reduce(
      (acc, tx) => {
        if (!tx.categoryName) return acc;
        const amount = Number(tx.amount);
        acc[tx.categoryName] = (acc[tx.categoryName] || 0) + amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const expenseBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / expenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Find most frequent expense category
    const categoryFrequency = monthlyTransactions.reduce(
      (acc, tx) => {
        if (!tx.categoryName) return acc;
        acc[tx.categoryName] = (acc[tx.categoryName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostFrequentCategory =
      Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      null;

    // Calculate risk metrics
    const largeExpenses = monthlyTransactions.filter(
      (tx) => Number(tx.amount) > income * 0.2,
    ).length;

    const lastIncome = monthlyTransactions
      .filter((tx) => tx.type === "deposit" || tx.type === "refund")
      .sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      )[0];

    const daysSinceLastIncome = lastIncome?.createdAt
      ? Math.floor(
          (now.getTime() - lastIncome.createdAt.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 30;

    // Get 6 months of monthly totals
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTotals = await db
      .select({
        month: sql<string>`date_trunc('month', ${transactions.createdAt})::text`,
        income: sql<number>`
          sum(case when ${transactions.type} in ('deposit', 'refund')
              then ${transactions.amount}::numeric else 0 end)`,
        expenses: sql<number>`
          sum(case when ${transactions.type} in ('withdrawal', 'payment')
              then ${transactions.amount}::numeric else 0 end)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.senderAccountId, bankAccount.id),
          gte(transactions.createdAt, sixMonthsAgo),
        ),
      )
      .groupBy(sql`date_trunc('month', ${transactions.createdAt})`)
      .orderBy(sql`date_trunc('month', ${transactions.createdAt})`);

    // Get category trends over time
    const categoryTrends = await db
      .select({
        month: sql<string>`date_trunc('month', ${transactions.createdAt})::text`,
        categoryName: categories.name,
        amount: sql<number>`sum(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.senderAccountId, bankAccount.id),
          gte(transactions.createdAt, sixMonthsAgo),
        ),
      )
      .groupBy(
        sql`date_trunc('month', ${transactions.createdAt})`,
        categories.name,
      )
      .orderBy(sql`date_trunc('month', ${transactions.createdAt})`);

    // Process category trends
    const categoryTrendsMap = categoryTrends.reduce(
      (acc, { month, categoryName, amount }) => {
        if (!categoryName) return acc;
        if (!acc[categoryName]) {
          acc[categoryName] = { category: categoryName, values: [] };
        }
        acc[categoryName].values.push({ month, amount });
        return acc;
      },
      {} as Record<
        string,
        { category: string; values: { month: string; amount: number }[] }
      >,
    );

    return {
      currentBalance: Number(bankAccount.balance),
      monthlyStats: {
        income,
        expenses,
        savings: income - expenses,
        largestExpense: Math.max(
          ...monthlyTransactions.map((tx) => Number(tx.amount)),
        ),
        mostFrequentExpenseCategory: mostFrequentCategory,
        transactionCount: monthlyTransactions.length,
      },
      trends: {
        averageTransactionSize:
          monthlyTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0) /
          monthlyTransactions.length,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
        expenseBreakdown: expenseBreakdown.slice(0, 5), // Top 5 categories
        monthlyTotals: monthlyTotals.map(({ month, income, expenses }) => ({
          month,
          income: Number(income),
          expenses: Number(expenses),
          savings: Number(income) - Number(expenses),
        })),
        categoryTrends: Object.values(categoryTrendsMap),
      },
      riskMetrics: {
        largeExpenses,
        daysSinceLastIncome,
        balanceVolatility: calculateBalanceVolatility(monthlyTransactions),
      },
    };
  } catch (error) {
    console.error("Error getting financial summary:", error);
    return null;
  }
}

function calculateBalanceVolatility(
  transactions: { amount: string; createdAt: Date | null }[],
): number {
  if (transactions.length < 2) return 0;

  // Calculate daily balances
  const dailyBalances = transactions.reduce(
    (acc, tx) => {
      if (!tx.createdAt) return acc;
      const date = tx.createdAt.toISOString().split("T")[0];
      acc[date!] = (acc[date!] || 0) + Number(tx.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  const balances = Object.values(dailyBalances);
  const mean = balances.reduce((sum, b) => sum + b, 0) / balances.length;
  const variance =
    balances.reduce((sum, b) => sum + Math.pow(b - mean, 2), 0) /
    balances.length;

  return Math.sqrt(variance);
}
