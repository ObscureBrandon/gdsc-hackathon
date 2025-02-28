import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "League Wallet",
  description:
    "League Wallet is a personal finance app that helps you manage your money.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <html lang="en" className={`${GeistSans.variable} dark`}>
        <body
          className={`bg-gradient-to-b from-slate-900 to-slate-950 antialiased`}
        >
          <div className="flex min-h-screen flex-col">
            <main className="flex-grow overflow-auto scroll-smooth">
              {children}
              <footer className="flex justify-center text-center text-slate-400">
                <p>
                  © {new Date().getFullYear()} League Wallet. All rights
                  reserved.
                </p>
              </footer>
            </main>
            <Toaster />
          </div>
        </body>
      </html>
    </SessionProvider>
  );
}
