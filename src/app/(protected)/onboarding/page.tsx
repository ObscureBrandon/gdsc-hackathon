"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Info } from "lucide-react";

const handleSchema = z
  .string()
  .min(3, "Handle must be at least 3 characters")
  .max(20, "Handle must be less than 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Handle can only contain letters, numbers, - and _",
  );

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [handle, setHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedingAttempted, setSeedingAttempted] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // Use a stable reference for the seeding function
  const attemptSeeding = useCallback(async () => {
    try {
      // Silently seed data in the background
      const seedResponse = await fetch("/api/user/seed", {
        method: "POST",
      });

      if (seedResponse.ok) {
        console.log("Background seeding complete");
        return true;
      } else {
        console.error(
          "Background seeding failed - will try again during handle submission",
        );
        return false;
      }
    } catch (err) {
      console.error("Error during background seeding:", err);
      return false;
    }
  }, []);

  // Check if user already has a handle and handle initial setup
  useEffect(() => {
    let isMounted = true;

    const checkUserStatus = async () => {
      // Don't do anything until session is loaded
      if (!session) {
        router.replace("/"); // Redirect to login if session is not loaded
        return;
      }

      if (isMounted) setPageReady(true);

      // If user already has a handle, redirect to dashboard
      if (session.user?.handle) {
        router.replace("/dashboard");
        return;
      } else if (!session.user?.handle) {
        router.replace("/onboarding");
      }

      // Only attempt seeding once
      if (!seedingAttempted && session.user?.id) {
        if (isMounted) setSeedingAttempted(true);
        await attemptSeeding();
      }
    };

    checkUserStatus();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [session, router, seedingAttempted, attemptSeeding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate handle
      handleSchema.parse(handle);

      // Try to save the handle
      const response = await fetch("/api/user/handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save handle");
      }

      // Update the session to include the new handle
      await updateSession();

      // Try seeding one more time if first attempt might have failed
      toast.info("Setting up your account with sample data...");

      try {
        const seedResponse = await fetch("/api/user/seed", {
          method: "POST",
        });

        if (seedResponse.ok) {
          const seedResult = await seedResponse.json();
          toast.success("Sample data added to your account!");

          // Wait a short delay to allow database operations to complete
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (seedError) {
        console.error("Error seeding data:", seedError);
        // Continue anyway since this is optional
      }

      toast.success("Welcome aboard!", {
        description: "Your handle has been set successfully.",
      });

      // Redirect to dashboard with a query param to indicate fresh setup
      router.push("/dashboard?newUser=true");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || "An unexpected error occurred");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while we determine if user needs onboarding
  if (!pageReady) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to League Wallet!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handle">Choose your unique handle</Label>
              <Input
                id="handle"
                placeholder="e.g. john_doe"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                disabled={isLoading}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-sm text-muted-foreground">
                This will be your unique identifier on the platform. You can use
                letters, numbers, underscores, and hyphens.
              </p>
            </div>

            <div className="flex items-center space-x-2 rounded-md bg-muted/50 px-3 py-2">
              <Info size={18} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                For demonstration purposes, your account will be set up with
                sample transaction data.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Setting up your account..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
