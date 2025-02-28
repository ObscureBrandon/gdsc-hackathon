"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>League Wallet Leaderboard</CardTitle>
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
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
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
                    ))
                  : leaderboard.map((entry, index) => {
                      const isCurrentUser =
                        session?.user?.handle === entry.handle;
                      return (
                        <TableRow
                          key={entry.handle}
                          className={
                            isCurrentUser
                              ? "bg-muted/50 hover:bg-muted"
                              : undefined
                          }
                        >
                          <TableCell className="font-medium">
                            #{index + 1}
                            {isCurrentUser && (
                              <span className="ml-2 text-muted-foreground">
                                (You)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{entry.handle}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                TIER_COLORS[
                                  entry.cluster as keyof typeof TIER_COLORS
                                ]
                              }
                            >
                              {TIER_NAMES[entry.cluster]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.points.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
