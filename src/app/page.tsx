"use client";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main>
      <h1>This is on dev</h1>
      {session && <h1>If you see this, you&apos;re signed in!</h1>}
      {session ? (
        <button onClick={() => signOut()}>Sign Out</button>
      ) : (
        <button onClick={() => signIn("google")}>Sign In</button>
      )}
    </main>
  );
}
