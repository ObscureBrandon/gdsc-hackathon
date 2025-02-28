"use client";

import { Suspense } from "react";
import { DashboardContent } from "./DashboardContent";
import { Skeleton } from "~/components/ui/skeleton";

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="mt-4 h-8 w-2/3" />
          </div>
        ))}
      </div>

      <Skeleton className="h-[400px] w-full rounded-lg" />

      <div className="grid">
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
          <div className="p-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}
