"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BellIcon,
  CreditCardIcon,
  DollarSignIcon,
  EyeIcon,
  EyeOffIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PieChartIcon,
  SettingsIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { FinancialAreaChart } from "~/components/area-chart-interactive";
import { signOut } from "next-auth/react";
import { getRecentTransactions } from "~/server/actions/recentTransactions";
import { getUserBankAccount } from "~/server/actions/bankAccounts";
import { getUserCard } from "~/server/actions/cardManagement";
import { Skeleton } from "~/components/ui/skeleton";

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const pathname = usePathname();

  // State for data from server actions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bankAccount, setBankAccount] = useState<any | null>(null);
  const [card, setCard] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      try {
        const [transactionsData, accountData, cardData] = await Promise.all([
          getRecentTransactions(10),
          getUserBankAccount(),
          getUserCard(),
        ]);
        setTransactions(transactionsData);
        setBankAccount(accountData);
        setCard(cardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate account totals
  const totalBalance = bankAccount ? bankAccount.balance : 0;

  const income = transactions
    .filter((tx) => !tx.isOutgoing)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.isOutgoing)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const savings = income - expenses;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
    { name: "Transactions", href: "/transactions", icon: ArrowRightIcon },
    { name: "Cards", href: "/cards", icon: CreditCardIcon },
    { name: "Analytics", href: "/analytics", icon: PieChartIcon },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-3 text-lg font-semibold"
              >
                <Image
                  src="/lw_simple.png"
                  alt="League Wallet"
                  width={40}
                  height={35}
                  className="rounded-md"
                />
                <span>League Wallet</span>
              </Link>
              <Separator className="my-4" />
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                    pathname === item.href &&
                      "bg-muted font-medium text-primary",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="flex items-center gap-3 font-semibold md:text-lg"
          >
            <Image
              src="/lw_simple.png"
              alt="League Wallet"
              width={40}
              height={35}
              className="rounded-md"
            />
            <span className="hidden md:inline-block">League Wallet</span>
          </Link>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="relative">
            <BellIcon className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0">
              3
            </Badge>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage alt="User" />
                  <AvatarFallback>
                    {/* Get user initials or use placeholder */}
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                  pathname === item.href && "bg-muted font-medium text-primary",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Balance
                </CardTitle>
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
          ) : (
            <FinancialAreaChart />
          )}

          <div className="grid">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest financial activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
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
                                (transaction.isOutgoing
                                  ? "Payment"
                                  : "Deposit")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                transaction.createdAt,
                              ).toLocaleDateString()}
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
                            {showBalance
                              ? transaction.amount.toFixed(2)
                              : "••••••"}
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
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Your saved payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cards">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cards">Card</TabsTrigger>
                    <TabsTrigger value="bank">Bank Account</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cards" className="space-y-4 pt-4">
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-[72px] w-full rounded-lg" />
                      </div>
                    ) : (
                      card && (
                        <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm opacity-80">Card Holder</p>
                              <p className="text-lg font-bold">
                                {card.cardholderName}
                              </p>
                            </div>
                            <CreditCardIcon className="h-8 w-8 opacity-80" />
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
                                ? card.cardNumber
                                : "•••• •••• •••• ••••"}
                            </p>
                          </div>
                          <div className="mt-6 flex justify-between">
                            <div>
                              <p className="text-xs opacity-80">VALID THRU</p>
                              <p>{showBalance ? card.expiryDate : "••/••"}</p>
                            </div>
                            <div>
                              <p className="text-xs opacity-80">CVV</p>
                              <p>{showBalance ? card.cvv : "•••"}</p>
                            </div>
                            <div>
                              <p className="text-xs opacity-80">CARD TYPE</p>
                              <p>{card.cardType}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Badge
                              variant={card.isActive ? "default" : "outline"}
                            >
                              {card.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      )
                    )}
                  </TabsContent>
                  <TabsContent value="bank" className="pt-4">
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
        </main>
      </div>
    </div>
  );
}
