"use client";

import { LoginForm } from "~/components/login-form";

export default function HomePage() {
  return (
    <section className="flex min-h-[96vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </section>
  );
}
