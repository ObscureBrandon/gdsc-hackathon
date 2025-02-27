"use client";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { data: session } = useSession();

  return (
    <div className={cn("flex flex-col gap-6 px-5", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex items-center justify-center rounded-md">
              <Image
                src="/lw_simple.png"
                alt="League Wallet"
                width={120}
                height={100}
                className="rounded-md"
              />
            </div>
            <span className="sr-only">League Wallet</span>
          </a>
          <h1 className="text-xl font-bold text-slate-200">
            Welcome to <span className="text-lime-300">League Wallet</span>
          </h1>
        </div>

        {!session ? (
          <div className="flex flex-col justify-center gap-2">
            <Button
              onClick={() => signIn("google", { redirectTo: "/dashboard" })}
              variant="outline"
              className="w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="w-full"
            >
              Sign out
            </Button>
          </div>
        )}
      </div>
      <div className="text-center text-sm text-slate-300">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms-of-service"
          className="text-lime-300 hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="text-lime-300 hover:underline">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
