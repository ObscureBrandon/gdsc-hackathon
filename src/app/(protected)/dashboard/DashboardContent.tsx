"use client";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  DollarSignIcon,
  EyeIcon,
  EyeOffIcon,
  GiftIcon,
  RefreshCwIcon,
  WalletIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FinancialAreaChart } from "~/components/area-chart-interactive";
import { SendMoneyDialog } from "~/components/SendMoneyDialog";
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

export function DashboardContent() {
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

  const getUserTier = () => {
    if (!bankAccount) return "Bronze";
    const balance = bankAccount.balance;

    if (balance >= 50000) return "Diamond";
    if (balance >= 20000) return "Platinum";
    if (balance >= 10000) return "Gold";
    if (balance >= 5000) return "Silver";
    return "Bronze";
  };

  // Add this object with the offers data
  const offers = {
    Bronze: [
      "5% Cashback on Supermarket Purchases",
      "5% Discount on Electricity and Water Bills",
      "10% discount on Gym memberships",
      "Free Coffee at Partner Cafés (once a month)",
    ],
    Silver: [
      "7% Cashback on Restaurant Bills",
      "Free Movie Ticket (once a month at partner cinemas)",
      "Annual Health Checkup Package",
      "50% Discount on Monthly Streaming Subscription",
    ],
    Gold: [
      "10% Cashback on Fashion and Electronics Purchases",
      "24/7 Priority Customer Support",
      "Travel Insurance up to $5000 per trip",
      "SUPERMARKET SALES UP TO 70%",
    ],
    Platinum: [
      "15% Cashback on Flight and Hotel Bookings",
      "Free 3 month Gym membership",
      "5 free rides with Traveling sponsor",
      "Free weekly meal at a fine dining resturant",
    ],
    Diamond: [
      "40% Cashback on All Online and Offline Purchases",
      "1 Year Free Gym membership",
      "Exclusive Private Banking Services",
      "Concert Invitation to LeagueWallets Premium clientele Events ",
    ],
  };

  const userTier = getUserTier();

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

  const refreshDashboardData = async () => {
    setIsLoading(true);
    try {
      const [transactionsData, accountData] = await Promise.all([
        getRecentTransactions(10),
        getUserBankAccount(),
      ]);

      if (transactionsData && accountData) {
        setTransactions(transactionsData);
        setBankAccount(accountData);
      }
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex justify-end">
        <Button variant="outline" onClick={refreshDashboardData}>
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
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
                      <Badge variant="outline" className="text-xs uppercase">
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
      <div className="grid gap-4 lg:grid-cols-4">
        {/* First row: Quick Actions and Offers side by side */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {bankAccount ? (
                <SendMoneyDialog
                  maxAmount={Number(bankAccount.balance)}
                  accountId={bankAccount.id}
                  onSuccess={refreshDashboardData}
                />
              ) : (
                <Button
                  className="flex h-24 flex-col items-center justify-center space-y-2"
                  disabled
                >
                  <ArrowRightIcon className="h-6 w-6" />
                  <span>Send Money</span>
                </Button>
              )}
              <Button className="flex h-24 flex-col items-center justify-center space-y-2">
                <WalletIcon className="h-6 w-6" />
                <span>Deposit Money</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle>Your {userTier} Offers</CardTitle>
              <GiftIcon className="h-6 w-6" />
            </div>
            <CardDescription className="text-white/80">
              Special perks for your tier
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-3">
                {offers[userTier]?.map((offer, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm">{offer}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/50 px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Offers valid until the end of the month
            </p>
          </CardFooter>
        </Card>

        {/* Second row: Bank Account card spanning full width */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Bank Account</CardTitle>
            <CardDescription>Your linked bank account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Fix: Change defaultValue to match the TabsContent value */}
            <Tabs defaultValue="bank">
              <TabsContent value="bank">
                {isLoading ? (
                  // Better loading state that matches the card design
                  <div className="rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 p-6">
                    <div className="flex justify-between">
                      <div>
                        <Skeleton className="h-4 w-20 bg-white/20" />
                        <Skeleton className="mt-2 h-6 w-40 bg-white/20" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
                    </div>

                    <div className="mt-6 flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24 bg-white/20" />
                        <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
                      </div>
                      <Skeleton className="h-6 w-48 bg-white/20" />
                    </div>
                    <div className="mt-6 flex justify-between">
                      <div>
                        <Skeleton className="h-3 w-16 bg-white/20" />
                        <Skeleton className="mt-2 h-5 w-20 bg-white/20" />
                      </div>
                      <div>
                        <Skeleton className="h-3 w-16 bg-white/20" />
                        <Skeleton className="mt-2 h-5 w-16 bg-white/20" />
                      </div>
                    </div>
                  </div>
                ) : bankAccount ? (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-400 p-6 text-white">
                    {/* Animated gradient overlay - added background-size property */}
                    <div className="animate-gradient-x absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-purple-500/30 to-indigo-600/30 bg-[length:200%_100%]" />

                    {/* Card content */}
                    <div className="relative z-10">
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
                          <p className="text-sm opacity-80">Account Number</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowBalance(!showBalance)}
                            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
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
                          <p className="text-lg font-semibold">
                            {showBalance
                              ? `$${bankAccount.balance.toFixed(2)}`
                              : "••••••"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-80">STATUS</p>
                          <Badge
                            variant={
                              bankAccount.isActive ? "outline" : "secondary"
                            }
                            className={
                              bankAccount.isActive
                                ? "border-white text-white"
                                : ""
                            }
                          >
                            {bankAccount.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed p-6">
                    <div className="text-center">
                      <DollarSignIcon className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-muted-foreground">
                        No bank account linked
                      </p>
                      <Button variant="outline" className="mt-4">
                        Link Account
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
