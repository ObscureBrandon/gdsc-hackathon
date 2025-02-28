import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  pgEnum,
  PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `gdsc-hackathon_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  bankAccounts: many(bankAccounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// Bank account table
export const bankAccounts = createTable("bank_account", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  accountNumber: varchar("account_number", { length: 20 }).notNull().unique(),
  accountName: varchar("account_name", { length: 100 }).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }) // 12 digits, 2 decimal places
    .notNull()
    .default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const bankAccountsRelations = relations(
  bankAccounts,
  ({ one, many }) => ({
    user: one(users, { fields: [bankAccounts.userId], references: [users.id] }),
    sentTransactions: many(transactions, { relationName: "senderAccount" }),
    receivedTransactions: many(transactions, {
      relationName: "receiverAccount",
    }),
  }),
);

// Transaction type enum
export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "withdrawal",
  "transfer",
  "payment",
  "refund",
]);

// Transaction status enum
export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
  "cancelled",
]);

// Transactions table
export const transactions = createTable("transaction", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  senderAccountId: varchar("sender_account_id", { length: 255 }).references(
    () => bankAccounts.id,
  ),
  receiverAccountId: varchar("receiver_account_id", { length: 255 }).references(
    () => bankAccounts.id,
  ),
  status: transactionStatusEnum("status").notNull().default("pending"),
  reference: varchar("reference", { length: 50 })
    .notNull()
    .$defaultFn(
      () =>
        `TXN-${Math.floor(Math.random() * 10000000)
          .toString()
          .padStart(7, "0")}`,
    ),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  // AI-friendly fields for analytics
  categoryId: varchar("category_id", { length: 255 }).references(
    () => categories.id,
  ),
  merchantName: varchar("merchant_name", { length: 255 }),
  location: varchar("location", { length: 255 }),
  // Store metadata that might be useful for AI analysis
  metadata: text("metadata"), // JSON stringified data
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  senderAccount: one(bankAccounts, {
    fields: [transactions.senderAccountId],
    references: [bankAccounts.id],
    relationName: "senderAccount",
  }),
  receiverAccount: one(bankAccounts, {
    fields: [transactions.receiverAccountId],
    references: [bankAccounts.id],
    relationName: "receiverAccount",
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

// Categories for transactions (for AI-driven analytics)
export const categories: PgTableWithColumns<any> = createTable("category", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  // Adding fields useful for AI classification and visualization
  parentCategoryId: varchar("parent_category_id", { length: 255 }).references(
    () => categories.id,
  ),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 10 }),
});

export const categoriesRelations = relations(categories, ({ one }) => ({
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
  }),
}));
