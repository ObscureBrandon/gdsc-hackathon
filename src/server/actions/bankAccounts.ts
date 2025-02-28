"use server";

import { db } from "~/server/db/index";
import { bankAccounts } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "~/server/auth";

export type BankAccount = {
  id: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
};

export async function getUserBankAccount(): Promise<BankAccount | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const accounts = await db
    .select({
      id: bankAccounts.id,
      accountNumber: bankAccounts.accountNumber,
      accountName: bankAccounts.accountName,
      balance: bankAccounts.balance,
      isActive: bankAccounts.isActive,
      createdAt: bankAccounts.createdAt,
    })
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, userId))
    .limit(1);

  if (accounts.length === 0 || !accounts[0]) return null;

  const account = accounts[0];
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    balance: Number(account.balance),
    isActive: account.isActive,
    createdAt: new Date(account.createdAt!),
  };
}

export async function addBankAccount(
  accountNumber: string,
  accountName: string,
  initialBalance: number = 0,
): Promise<BankAccount | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  // Check if user already has an account
  const existingAccount = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, userId))
    .limit(1);

  if (existingAccount.length > 0) {
    throw new Error("You already have a bank account registered");
  }

  // Check if account with this number already exists (for other users)
  const duplicateAccount = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.accountNumber, accountNumber))
    .limit(1);

  if (duplicateAccount.length > 0) {
    throw new Error("An account with this number already exists");
  }

  const [newAccount] = await db
    .insert(bankAccounts)
    .values({
      userId,
      accountNumber,
      accountName,
      balance: initialBalance.toString(),
    })
    .returning();

  if (!newAccount) return null;

  return {
    id: newAccount.id,
    accountNumber: newAccount.accountNumber,
    accountName: newAccount.accountName,
    balance: Number(newAccount.balance),
    isActive: newAccount.isActive,
    createdAt: new Date(newAccount.createdAt!),
  };
}
