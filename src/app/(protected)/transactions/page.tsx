"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowDownUp,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  getAllTransactions,
  type SortDirection,
  type SortField,
} from "~/server/actions/getAllTransactions";
import { TransactionWithDetails } from "~/server/actions/recentTransactions";

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true);
      try {
        const result = await getAllTransactions({
          page,
          pageSize,
          sortField,
          sortDirection,
        });

        setTransactions(result.data);
        setTotalPages(result.pageCount);
        setTotalItems(result.total);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [page, pageSize, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Default to desc when switching fields
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Generate pagination controls
  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {transactions.length} of {totalItems} transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Transactions History</CardTitle>
            <CardDescription>
              View and manage all your financial activities
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showBalance ? "Hide Balance" : "Show Balance"}
            </span>
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
              <p>{error}</p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-0 font-medium"
                    onClick={() => handleSort("date")}
                  >
                    Date & Time
                    <ArrowDownUp
                      className={cn(
                        "h-3 w-3",
                        sortField === "date" ? "opacity-100" : "opacity-50",
                      )}
                    />
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-0 font-medium"
                    onClick={() => handleSort("merchant")}
                  >
                    Merchant
                    <ArrowDownUp
                      className={cn(
                        "h-3 w-3",
                        sortField === "merchant" ? "opacity-100" : "opacity-50",
                      )}
                    />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="ml-auto flex items-center gap-2 p-0 font-medium"
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                    <ArrowDownUp
                      className={cn(
                        "h-3 w-3",
                        sortField === "amount" ? "opacity-100" : "opacity-50",
                      )}
                    />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-5 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-5 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : transactions.length > 0 ? (
                // Transaction rows
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {formatDate(new Date(transaction.createdAt))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full",
                            transaction.isOutgoing
                              ? "bg-red-100"
                              : "bg-green-100",
                          )}
                        >
                          {transaction.isOutgoing ? (
                            <ArrowUpIcon className="h-3 w-3 text-red-500" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        <span className="line-clamp-1">
                          {transaction.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.categoryName ? (
                        <div className="flex items-center gap-1.5">
                          <span>{transaction.categoryIcon}</span>
                          <span>{transaction.categoryName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Uncategorized
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.merchantName ||
                        (transaction.isOutgoing ? "Payment" : "Deposit")}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          transaction.isOutgoing
                            ? "text-red-500"
                            : "text-green-500",
                        )}
                      >
                        {transaction.isOutgoing ? "-" : "+"}$
                        {showBalance ? transaction.amount.toFixed(2) : "••••••"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="uppercase">
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>No transactions found</p>
                      <p className="text-sm">
                        You don't have any recorded transactions yet.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          {!isLoading && transactions.length > 0 && renderPagination()}
        </CardFooter>
      </Card>
    </div>
  );
}
