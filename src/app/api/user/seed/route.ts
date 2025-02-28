import { db } from "~/server/db";
import { bankAccounts, transactions, categories } from "~/server/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { auth } from "~/server/auth";

type TransactionType =
  | "payment"
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "refund";

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    // Create default categories if they don't exist
    const categoriesData = [
      { name: "Food & Dining", icon: "🍔", color: "#FF5733" },
      { name: "Shopping", icon: "🛍️", color: "#33FF57" },
      { name: "Housing", icon: "🏠", color: "#3357FF" },
      { name: "Transportation", icon: "🚗", color: "#F3FF33" },
      { name: "Entertainment", icon: "🎬", color: "#FF33F6" },
      { name: "Health", icon: "🏥", color: "#33FFF3" },
      { name: "Travel", icon: "✈️", color: "#8C33FF" },
      { name: "Education", icon: "📚", color: "#FF8C33" },
      { name: "Income", icon: "💰", color: "#33FF8C" },
      { name: "Investments", icon: "📈", color: "#8CFF33" },
      { name: "Gifts", icon: "🎁", color: "#FF338C" },
    ];

    // Check if categories exist
    const existingCategories = await db.select().from(categories);

    // Create categories if none exist
    if (existingCategories.length === 0) {
      console.log("Creating default categories...");
      await db.insert(categories).values(categoriesData);
    }

    // Get all categories (either existing or newly created)
    const availableCategories = await db.select().from(categories);

    if (availableCategories.length === 0) {
      return NextResponse.json(
        { error: "Failed to create categories" },
        { status: 500 },
      );
    }

    // Build category map for easy reference
    const categoryMap: Record<string, string> = {};
    availableCategories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    // Get or create user's bank account
    let userAccount;

    // Check if the user has a bank account already
    const existingAccount = await db
      .select()
      .from(bankAccounts)
      .where(sql`user_id = ${userId}`)
      .limit(1);

    // If no bank account exists, create one
    if (existingAccount.length === 0) {
      console.log("Creating bank account for user:", userId);

      const accountData = {
        userId,
        accountNumber: generateUniqueAccountNumber(),
        accountName: "Main Checking",
        balance: "5000.00",
      };

      const [newAccount] = await db
        .insert(bankAccounts)
        .values(accountData)
        .returning();

      userAccount = newAccount;
    } else {
      userAccount = existingAccount[0];
    }

    if (!userAccount) {
      return NextResponse.json(
        { error: "Failed to create or retrieve bank account" },
        { status: 500 },
      );
    }

    // Generate and insert transaction data
    const result = await generateTransactionData(
      userId,
      userAccount,
      categoryMap,
    );

    return NextResponse.json({
      success: true,
      message: "Transaction data seeded successfully",
      stats: result,
    });
  } catch (error) {
    console.error("Error seeding transaction data:", error);
    return NextResponse.json(
      { error: "Failed to seed transaction data" },
      { status: 500 },
    );
  }
}

// Helper function to generate a unique bank account number
function generateUniqueAccountNumber(): string {
  // Generate a 10-digit account number
  const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
  return randomNum.toString();
}

async function generateTransactionData(
  userId: string,
  userAccount: any,
  categoryMap: Record<string, string>,
) {
  // Clear existing transactions for this account
  await db
    .delete(transactions)
    .where(
      sql`sender_account_id = ${userAccount.id} OR receiver_account_id = ${userAccount.id}`,
    );

  // Configuration for transaction generation
  const daysToGenerate = 60; // Last 60 days
  const today = new Date();
  const startingBalance = 5000.0; // Initial balance
  let runningBalance = startingBalance;

  const merchants = [
    "Amazon",
    "Walmart",
    "Target",
    "Uber",
    "Netflix",
    "Spotify",
    "Apple",
    "Gas Station",
    "Grocery Store",
    "Restaurant",
    "Starbucks",
    "Gym",
    "Pharmacy",
    "Hardware Store",
    "Coffee Shop",
    "Clothing Store",
  ];

  const descriptions = [
    "Monthly subscription",
    "Weekly groceries",
    "Transportation",
    "Online purchase",
    "Bill payment",
    "Dining out",
    "Coffee",
    "Entertainment",
    "Home supplies",
    "Clothes shopping",
    "Electronics",
    "Healthcare",
    "Fitness",
    "Books",
  ];

  // Determine inactive days percentage (10-50% of total days)
  const inactiveDaysPercentage = 10 + Math.floor(Math.random() * 41);
  const inactiveDaysCount = Math.floor(
    (daysToGenerate * inactiveDaysPercentage) / 100,
  );

  // Create an array of all days
  const allDays: Date[] = Array.from({ length: daysToGenerate }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date;
  });

  // Randomly select inactive days
  const inactiveDaysSet = new Set();
  while (inactiveDaysSet.size < inactiveDaysCount) {
    const randomIndex = Math.floor(Math.random() * daysToGenerate);
    inactiveDaysSet.add(randomIndex);
  }

  // Generate transactions for active days
  const transactionsData = [];
  let totalTransactions = 0;
  let totalInflow = 0;
  let totalOutflow = 0;

  for (let i = 0; i < daysToGenerate; i++) {
    // Skip if this is an inactive day
    if (inactiveDaysSet.has(i)) continue;

    const date = allDays[i];

    // Each active day has 1-3 transactions
    const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < transactionsPerDay; j++) {
      // Set different times for transactions on the same day
      if (!date) {
        throw new Error("Date is undefined");
      }
      const transactionTime = new Date(date);
      transactionTime.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
      );

      // Decide transaction type with bias toward payments (65% outgoing, 35% incoming)
      const isPayment = Math.random() > 0.35;
      const txType: TransactionType = isPayment ? "payment" : "deposit";

      // Calculate a reasonable amount based on balance to avoid negative balance
      let amount;
      if (isPayment) {
        // For payments, ensure we don't exceed balance (leave at least $50)
        const maxPayment = Math.max(0, runningBalance - 50);
        // Generate between $1 and the lower of $500 or maxPayment
        amount = Math.min(Math.random() * 499 + 1, maxPayment).toFixed(2);
      } else {
        // For deposits, generate between $50 and $2000
        amount = (Math.random() * 1950 + 50).toFixed(2);
      }

      // Select random merchant and description
      const merchantName =
        merchants[Math.floor(Math.random() * merchants.length)];
      const description =
        descriptions[Math.floor(Math.random() * descriptions.length)];

      // Select category based on merchant - with null checks and default values
      let categoryId = categoryMap["Shopping"]; // Default if no match

      // Ensure we have a valid default category even if categoryMap is incomplete
      if (!categoryId && Object.values(categoryMap).length > 0) {
        categoryId = Object.values(categoryMap)[0];
      }

      // Now try to find a better match
      if (
        merchantName === "Amazon" ||
        merchantName === "Walmart" ||
        merchantName === "Target" ||
        merchantName === "Clothing Store"
      ) {
        categoryId = categoryMap["Shopping"] || categoryId;
      } else if (merchantName === "Uber" || merchantName === "Gas Station") {
        categoryId = categoryMap["Transportation"] || categoryId;
      } else if (
        merchantName === "Netflix" ||
        merchantName === "Spotify" ||
        merchantName === "Apple"
      ) {
        categoryId = categoryMap["Entertainment"] || categoryId;
      } else if (
        merchantName === "Grocery Store" ||
        merchantName === "Restaurant" ||
        merchantName === "Starbucks" ||
        merchantName === "Coffee Shop"
      ) {
        categoryId = categoryMap["Food & Dining"] || categoryId;
      } else if (merchantName === "Pharmacy") {
        categoryId = categoryMap["Health"] || categoryId;
      }

      // For transactions, we need to determine sender and receiver
      let senderAccountId, receiverAccountId;

      if (isPayment) {
        // Payment: money leaves the user's account
        senderAccountId = userAccount.id;
        receiverAccountId = null; // External payee
        runningBalance -= parseFloat(amount);
        totalOutflow += parseFloat(amount);
      } else {
        // Deposit: money comes into user's account
        senderAccountId = null; // External source
        receiverAccountId = userAccount.id;
        runningBalance += parseFloat(amount);
        totalInflow += parseFloat(amount);
      }

      // Create the transaction
      transactionsData.push({
        type: txType,
        amount,
        description: `${description} - ${merchantName}`,
        senderAccountId,
        receiverAccountId,
        status: "completed" as const,
        categoryId,
        merchantName,
        createdAt: transactionTime,
      });

      totalTransactions++;
    }
  }

  // Insert all transactions
  if (transactionsData.length > 0) {
    await db.insert(transactions).values(transactionsData);
  }

  // Update account balance
  await db
    .update(bankAccounts)
    .set({ balance: runningBalance.toFixed(2) })
    .where(sql`id = ${userAccount.id}`);

  return {
    totalTransactions,
    activeDays: daysToGenerate - inactiveDaysCount,
    inactiveDays: inactiveDaysCount,
    inactiveDaysPercentage,
    totalInflow: totalInflow.toFixed(2),
    totalOutflow: totalOutflow.toFixed(2),
    finalBalance: runningBalance.toFixed(2),
  };
}
