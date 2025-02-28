"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

type LeaderboardEntry = {
  handle: string;
  cluster: number;
  points: number;
};

const TIER_NAMES = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const TIER_COLORS = {
  0: "bg-bronze text-bronze-foreground",
  1: "bg-silver text-silver-foreground",
  2: "bg-gold text-gold-foreground",
  3: "bg-platinum text-platinum-foreground",
  4: "bg-diamond text-diamond-foreground",
};

const TIER_ICONS = {
  0: "/bronze.png",
  1: "/silver.png",
  2: "/golden.png",
  3: "/plat.png",
  4: "/diamond.png",
};

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        const data = await response.json();
        setLeaderboard(
          data.sort(
            (a: LeaderboardEntry, b: LeaderboardEntry) => b.points - a.points,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const renderLeaderboardRows = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i + "-skeleton"}>
          <TableCell key={i + "-rank"}>
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
        </TableRow>
      ));
    }

    let currentCluster: number | null = null;
    return leaderboard.map((entry, index) => {
      const isCurrentUser = session?.user?.handle === entry.handle;
      const isNewCluster = currentCluster !== entry.cluster;
      currentCluster = entry.cluster;

      // Use a unique key for each fragment
      return (
        <Fragment key={`${entry.handle}-group`}>
          {isNewCluster && (
            <TableRow className="bg-muted/30">
              <TableCell colSpan={4} className="py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12">
                    <Image
                      key={`${entry.cluster}-${entry.handle}`}
                      src={TIER_ICONS[entry.cluster as keyof typeof TIER_ICONS]}
                      alt={`${TIER_NAMES[entry.cluster]} tier`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="text-lg font-semibold">
                    {TIER_NAMES[entry.cluster]} League
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )}
          <TableRow
            key={entry.handle}
            className={
              isCurrentUser
                ? "bg-muted/50 hover:bg-muted/30"
                : "hover:bg-muted/20"
            }
          >
            <TableCell className="font-medium">
              #{index + 1}
              {isCurrentUser && (
                <span className="ml-2 text-muted-foreground">(You)</span>
              )}
            </TableCell>
            <TableCell>{entry.handle}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={`transition-colors ${
                  TIER_COLORS[entry.cluster as keyof typeof TIER_COLORS]
                } hover:bg-opacity-75`}
              >
                {TIER_NAMES[entry.cluster]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {entry.points.toFixed(2)}
            </TableCell>
          </TableRow>
        </Fragment>
      );
    });
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            League Wallet Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Handle</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderLeaderboardRows()}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
