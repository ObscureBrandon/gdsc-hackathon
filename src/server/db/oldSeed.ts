/* import { db } from "~/server/db/indexScript";
import {
  users,
  bankAccounts,
  transactions,
  categories,
  cards,
} from "~/server/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Started seeding placeholder data...");

  // Get a user to add data for (you need to have at least one user in the database)
  const existingUser = await db.select().from(users).limit(1);

  if (existingUser.length === 0 || !existingUser[0]) {
    console.error("No users found. Please create a user first by logging in.");
    return;
  }

  const userId = existingUser[0].id;
  console.log(`Adding data for user: ${existingUser[0].email}`);

  // Create Categories
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

  const insertedCategories = await db
    .insert(categories)
    .values(categoriesData)
    .returning();

  console.log(`Added ${insertedCategories.length} categories`);

  const categoryMap: Record<string, string> = {};
  insertedCategories.forEach((cat) => {
    categoryMap[cat.name] = cat.id;
  });

  // First, check if the user already has a bank account
  const existingAccount = await db
    .select()
    .from(bankAccounts)
    .where(sql`user_id = ${userId}`)
    .limit(1);

  let bankAccount;
  // If no account exists, create one
  if (existingAccount.length === 0) {
    // Create a single Bank Account
    const accountData = {
      userId,
      accountNumber: "1000000001",
      accountName: "Main Checking",
      balance: "5000.00",
    };

    const [insertedAccount] = await db
      .insert(bankAccounts)
      .values(accountData)
      .returning();

    if (!insertedAccount) {
      console.error("Failed to create bank account");
      return;
    }

    console.log(`Added bank account: ${insertedAccount.accountName}`);
    bankAccount = insertedAccount;
  } else {
    console.log("User already has a bank account, skipping account creation");
    bankAccount = existingAccount[0];
  }

  // Check if user already has a card
  const existingCard = await db
    .select()
    .from(cards)
    .where(sql`user_id = ${userId}`)
    .limit(1);

  // If no card exists, create one
  if (existingCard.length === 0) {
    // Create a credit card for the user
    const cardData = {
      userId,
      cardNumber: "4111111111111111", // Example Visa format
      cardholderName: existingUser[0].name || "Card User",
      expiryDate: "12/27", // Format: MM/YY
      cvv: "123",
      cardType: "Visa",
    };

    const [insertedCard] = await db.insert(cards).values(cardData).returning();

    if (!insertedCard) {
      console.error("Failed to create card");
      return;
    }

    console.log(`Added card for user: ${insertedCard.cardholderName}`);
  } else {
    console.log("User already has a card, skipping card creation");
  }

  // Create Transactions - last 60 days of data
  const transactionsData = [];
  const today = new Date();
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
  ];

  // First, clear any existing transactions for this user's account
  await db
    .delete(transactions)
    .where(
      sql`sender_account_id = ${bankAccount?.id} OR receiver_account_id = ${bankAccount?.id}`,
    );

  console.log("Cleared existing transactions");

  // Generate random transactions across the past 60 days
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
    );

    // Each day has 1-3 transactions
    const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < transactionsPerDay; j++) {
      // Decide on transaction type
      // Since we only have one account, we'll simplify to just payments and deposits
      const txType: "deposit" | "payment" =
        Math.random() > 0.35 ? "payment" : "deposit";

      // Generate amount between $1 and $500
      const amount = (Math.random() * 499 + 1).toFixed(2);

      // Select random merchant and description
      const merchantName =
        merchants[Math.floor(Math.random() * merchants.length)];
      const description =
        descriptions[Math.floor(Math.random() * descriptions.length)];

      // Select category based on merchant
      let categoryId;
      if (
        merchantName === "Amazon" ||
        merchantName === "Walmart" ||
        merchantName === "Target"
      ) {
        categoryId = categoryMap["Shopping"];
      } else if (merchantName === "Uber" || merchantName === "Gas Station") {
        categoryId = categoryMap["Transportation"];
      } else if (merchantName === "Netflix" || merchantName === "Spotify") {
        categoryId = categoryMap["Entertainment"];
      } else if (
        merchantName === "Grocery Store" ||
        merchantName === "Restaurant" ||
        merchantName === "Starbucks"
      ) {
        categoryId = categoryMap["Food & Dining"];
      } else {
        categoryId = categoryMap["Shopping"]; // Default
      }

      // For transactions, we need to determine sender and receiver
      let senderAccountId, receiverAccountId;

      if (txType === "payment") {
        // Payment: money leaves the user's account
        senderAccountId = bankAccount?.id;
        receiverAccountId = null; // External payee
      } else {
        // deposit: money comes into user's account
        senderAccountId = null; // External source
        receiverAccountId = bankAccount?.id;
      }

      // Create the transaction with the appropriate date
      transactionsData.push({
        type: txType,
        amount,
        description: `${description} - ${merchantName}`,
        senderAccountId,
        receiverAccountId,
        status: "completed" as const,
        categoryId,
        merchantName,
        createdAt: date,
      });
    }
  }

  // Insert all transactions
  const insertedTransactions = await db
    .insert(transactions)
    .values(transactionsData)
    .returning();

  console.log(`Added ${insertedTransactions.length} transactions`);

  // Update account balance
  await updateBalances(userId);

  console.log("Updated account balance based on transactions");
  console.log("Seeding completed successfully!");
}

main().catch((err) => {
  console.error("Error seeding data:", err);
  process.exit(1);
});

// Simplified balance update for a single account
async function updateBalances(userId: string) {
  try {
    // Get the user's bank account
    const account = await db
      .select()
      .from(bankAccounts)
      .where(sql`user_id = ${userId}`)
      .limit(1);

    if (account.length === 0 || !account[0]) {
      console.log("No bank account found for this user");
      return;
    }

    // Calculate outgoing transactions sum
    const outgoingResult = await db
      .select({ sum: sql`COALESCE(SUM(CAST(amount AS DECIMAL(12,2))), 0)` })
      .from(transactions)
      .where(
        sql`sender_account_id = ${account[0].id} AND status = 'completed'`,
      );

    // Calculate incoming transactions sum
    const incomingResult = await db
      .select({ sum: sql`COALESCE(SUM(CAST(amount AS DECIMAL(12,2))), 0)` })
      .from(transactions)
      .where(
        sql`receiver_account_id = ${account[0].id} AND status = 'completed'`,
      );

    // Set starting balance
    const startingBalance = "5000.00";

    // Calculate final balance
    const outgoingSum = outgoingResult[0]?.sum ?? 0;
    const incomingSum = incomingResult[0]?.sum ?? 0;
    const finalBalance = (
      parseFloat(startingBalance) -
      parseFloat(outgoingSum.toString()) +
      parseFloat(incomingSum.toString())
    ).toFixed(2);

    // Update the account balance
    await db
      .update(bankAccounts)
      .set({ balance: finalBalance })
      .where(sql`id = ${account[0].id}`);

    console.log(`Account balance updated to $${finalBalance}`);
  } catch (error) {
    console.error("Error updating account balance:", error);
    throw error;
  }
}
 */