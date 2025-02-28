"use client";

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
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AreaChart, BarChart, LineChart } from "~/components/chart";
import { LeagueOffer } from "~/components/league-offer";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const pathname = usePathname();

  // Mock data for charts
  const areaChartData = [
    { name: "Jan", total: 1200 },
    { name: "Feb", total: 1900 },
    { name: "Mar", total: 1500 },
    { name: "Apr", total: 2400 },
    { name: "May", total: 2800 },
    { name: "Jun", total: 2600 },
    { name: "Jul", total: 3200 },
  ];

  const barChartData = [
    { name: "Mon", total: 120 },
    { name: "Tue", total: 220 },
    { name: "Wed", total: 190 },
    { name: "Thu", total: 270 },
    { name: "Fri", total: 320 },
    { name: "Sat", total: 190 },
    { name: "Sun", total: 90 },
  ];

  const lineChartData = [
    { name: "Week 1", value: 400 },
    { name: "Week 2", value: 300 },
    { name: "Week 3", value: 500 },
    { name: "Week 4", value: 780 },
  ];

  // Mock transaction data
  const transactions = [
    {
      id: "t1",
      name: "Amazon",
      type: "expense",
      amount: 49.99,
      date: "Today, 2:34 PM",
      status: "completed",
    },
    {
      id: "t2",
      name: "Salary Deposit",
      type: "income",
      amount: 2500.0,
      date: "Yesterday, 9:12 AM",
      status: "completed",
    },
    {
      id: "t3",
      name: "Netflix",
      type: "expense",
      amount: 15.99,
      date: "Jul 12, 2023",
      status: "completed",
    },
    {
      id: "t4",
      name: "Transfer to Sarah",
      type: "transfer",
      amount: 200.0,
      date: "Jul 10, 2023",
      status: "completed",
    },
    {
      id: "t5",
      name: "Uber",
      type: "expense",
      amount: 24.5,
      date: "Jul 8, 2023",
      status: "completed",
    },
  ];

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
                  <AvatarImage
                    //src="/placeholder.svg?height=32&width=32"
                    alt="User"
                  />
                  <AvatarFallback>JD</AvatarFallback>
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
          <LeagueOffer />
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
                <div className="text-2xl font-bold">
                  {showBalance ? "$12,580.00" : "••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <DollarSignIcon className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showBalance ? "$4,395.00" : "••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <DollarSignIcon className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showBalance ? "$2,150.00" : "••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  -5.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings</CardTitle>
                <WalletIcon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showBalance ? "$6,035.00" : "••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8.3% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  Your financial activity for the past 7 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AreaChart
                  data={areaChartData}
                  index="name"
                  categories={["total"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Weekly Spending</CardTitle>
                <CardDescription>
                  Your spending pattern for the current week
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart
                  data={barChartData}
                  index="name"
                  categories={["total"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Monthly Savings</CardTitle>
                <CardDescription>
                  Your savings trend for the past month
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart
                  data={lineChartData}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest financial activities
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                            transaction.type === "expense"
                              ? "bg-red-100"
                              : transaction.type === "income"
                                ? "bg-green-100"
                                : "bg-blue-100",
                          )}
                        >
                          {transaction.type === "expense" ? (
                            <ArrowUpIcon className="h-5 w-5 text-red-500" />
                          ) : transaction.type === "income" ? (
                            <ArrowDownIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowRightIcon className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            transaction.type === "expense"
                              ? "text-red-500"
                              : transaction.type === "income"
                                ? "text-green-500"
                                : "",
                          )}
                        >
                          {transaction.type === "expense"
                            ? "-"
                            : transaction.type === "income"
                              ? "+"
                              : ""}
                          ${transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Transactions
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
                <div className="grid grid-cols-2 gap-4">
                  <Button className="flex h-24 flex-col items-center justify-center space-y-2">
                    <ArrowRightIcon className="h-6 w-6" />
                    <span>Send Money</span>
                  </Button>
                  <Button className="flex h-24 flex-col items-center justify-center space-y-2">
                    <CreditCardIcon className="h-6 w-6" />
                    <span>Add Card</span>
                  </Button>
                  <Button className="flex h-24 flex-col items-center justify-center space-y-2">
                    <PieChartIcon className="h-6 w-6" />
                    <span>Investments</span>
                  </Button>
                  <Button className="flex h-24 flex-col items-center justify-center space-y-2">
                    <WalletIcon className="h-6 w-6" />
                    <span>Top Up</span>
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
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cards">Cards</TabsTrigger>
                    <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cards" className="space-y-4 pt-4">
                    <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm opacity-80">Balance</p>
                          <p className="text-2xl font-bold">
                            {showBalance ? "$8,250.00" : "••••••••"}
                          </p>
                        </div>
                        <CreditCardIcon className="h-8 w-8 opacity-80" />
                      </div>
                      <div className="mt-6">
                        <p className="text-sm opacity-80">Card Number</p>
                        <p className="text-lg">
                          {showBalance
                            ? "•••• •••• •••• 4242"
                            : "•••• •••• •••• ••••"}
                        </p>
                      </div>
                      <div className="mt-6 flex justify-between">
                        <div>
                          <p className="text-xs opacity-80">VALID THRU</p>
                          <p>{showBalance ? "12/25" : "••/••"}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-80">CVV</p>
                          <p>{showBalance ? "•••" : "•••"}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-80">CARD HOLDER</p>
                          <p>John Doe</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <CreditCardIcon className="mr-2 h-4 w-4" />
                      Add New Card
                    </Button>
                  </TabsContent>
                  <TabsContent value="bank" className="pt-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <DollarSignIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Chase Bank</p>
                            <p className="text-sm text-muted-foreground">
                              {showBalance ? "••••4567" : "••••••••"}
                            </p>
                          </div>
                        </div>
                        <Badge>Primary</Badge>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="crypto" className="pt-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <DollarSignIcon className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">
                        No Crypto Wallets
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You haven't added any cryptocurrency wallets yet.
                      </p>
                      <Button className="mt-4">Connect Wallet</Button>
                    </div>
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
