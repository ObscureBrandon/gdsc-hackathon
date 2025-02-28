"use client";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  DollarSignIcon,
  EyeIcon,
  EyeOffIcon,
  WalletIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FinancialAreaChart } from "~/components/area-chart-interactive";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { getUserBankAccount } from "~/server/actions/bankAccounts";
import { getRecentTransactions } from "~/server/actions/recentTransactions";

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("newUser") === "true";

  // State for data from server actions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bankAccount, setBankAccount] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [transactionsData, accountData] = await Promise.all([
          getRecentTransactions(10),
          getUserBankAccount(),
        ]);

        // Check if we got valid data back
        const hasValidData =
          Array.isArray(transactionsData) && accountData !== null;

        if (hasValidData) {
          setTransactions(transactionsData);
          setBankAccount(accountData);
          setIsLoading(false);

          // If this was a new user redirect, clean up the URL
          if (isNewUser) {
            // Replace URL without the query param, but don't trigger a navigation
            window.history.replaceState({}, "", "/dashboard");
          }
        } else if (isNewUser && retryCount < 3) {
          // For new users, retry a few times if data isn't ready yet
          console.log(`Data not ready yet. Retrying... (${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 1500);
        } else {
          // Give up and just show empty state
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [isNewUser, retryCount]);

  // Calculate account totals
  const totalBalance = bankAccount ? bankAccount.balance : 0;

  const income = transactions
    .filter((tx) => !tx.isOutgoing)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.isOutgoing)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const savings = income - expenses;

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="h-8 w-8"
            >
              {showBalance ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {showBalance ? `$${totalBalance.toFixed(2)}` : "••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bankAccount ? "Active account" : "No account linked"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {showBalance ? `$${income.toFixed(2)}` : "••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  From recent transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {showBalance ? `$${expenses.toFixed(2)}` : "••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  From recent transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <WalletIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {showBalance ? `$${savings.toFixed(2)}` : "••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Income - Expenses
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>
                <Skeleton className="h-6 w-40" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="mt-2 h-4 w-60" />
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-[180px]" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="mb-4 flex items-center gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex items-center">
                    <Skeleton className="mr-1.5 h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[350px] w-full">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed p-8">
                <Skeleton className="h-full w-full rounded-lg opacity-50" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <FinancialAreaChart />
      )}
      {/* Rest of the content remains the same */}
      <div className="grid">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            {/* ... existing transaction content ... */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="mt-2 h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="mt-2 h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          transaction.isOutgoing
                            ? "bg-red-100"
                            : "bg-green-100",
                        )}
                      >
                        {transaction.isOutgoing ? (
                          <ArrowUpIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDownIcon className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.merchantName ||
                            (transaction.isOutgoing ? "Payment" : "Deposit")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          transaction.isOutgoing
                            ? "text-red-500"
                            : "text-green-500",
                        )}
                      >
                        {transaction.isOutgoing ? "-" : "+"}$
                        {showBalance ? transaction.amount.toFixed(2) : "••••••"}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No recent transactions
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/transactions">View All Transactions</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Button className="flex h-24 flex-col items-center justify-center space-y-2">
                <ArrowRightIcon className="h-6 w-6" />
                <span>Send Money</span>
              </Button>
              <Button className="flex h-24 flex-col items-center justify-center space-y-2">
                <WalletIcon className="h-6 w-6" />
                <span>Deposit Money</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bank Account</CardTitle>
            <CardDescription>Your linked bank account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cards">
              <TabsContent value="bank">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-[72px] w-full rounded-lg" />
                  </div>
                ) : (
                  bankAccount && (
                    <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm opacity-80">Account Name</p>
                          <p className="text-lg font-bold">
                            {bankAccount.accountName}
                          </p>
                        </div>
                        <DollarSignIcon className="h-8 w-8 opacity-80" />
                      </div>

                      <div className="mt-6 flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm opacity-80">Card Number</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowBalance(!showBalance)}
                            className="h-8 w-8"
                          >
                            {showBalance ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-lg">
                          {showBalance
                            ? bankAccount.accountNumber
                            : "*".repeat(8) +
                              bankAccount.accountNumber.slice(-4)}
                        </p>
                      </div>
                      <div className="mt-6 flex justify-between">
                        <div>
                          <p className="text-xs opacity-80">BALANCE</p>
                          <p>
                            {showBalance
                              ? `$${bankAccount.balance.toFixed(2)}`
                              : "••••••"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-80">STATUS</p>
                          <Badge
                            variant={
                              bankAccount.isActive ? "default" : "outline"
                            }
                          >
                            {bankAccount.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
