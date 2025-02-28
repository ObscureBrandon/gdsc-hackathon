"use client";

import { useState } from "react";
import {
  ArrowRightIcon,
  Bot,
  EyeIcon,
  EyeOffIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { signOut, useSession } from "next-auth/react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Navigation items shared across protected routes
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
    { name: "Transactions", href: "/transactions", icon: ArrowRightIcon },
    { name: "AI Advisor", href: "/advisor", icon: Bot },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
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

        {/* Navigation items in the top navbar */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                pathname === item.href && "bg-muted font-medium text-primary",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile navigation menu */}
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
                href="/dashboard"
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

        <div className="flex-1 md:hidden"></div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage alt="User" />
                  <AvatarFallback className="uppercase">
                    {session?.user?.handle?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>@{session?.user?.handle}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="h-16"></div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
