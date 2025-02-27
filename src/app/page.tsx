"use client";

import { LoginForm } from "~/components/login-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Show nothing while redirecting
  if (session) {
    return null;
  }

  return (
    <section className="flex min-h-[96vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </section>
  );
}
