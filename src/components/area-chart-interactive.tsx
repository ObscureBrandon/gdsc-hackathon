"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox"; // You'll need to create or import this
import { Label } from "~/components/ui/label"; // You'll need to create or import this
import { ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { useEffect } from "react";
import { getFinancialChartData } from "~/server/actions/financialChartData";
import { Skeleton } from "./ui/skeleton";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length || !label) {
    return null;
  }

  const date = new Date(label);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border bg-popover p-2 shadow-md">
      <p className="mb-2 font-medium text-popover-foreground">
        {formattedDate}
      </p>
      {payload.map((entry: any, index: number) => (
        <div
          key={`item-${index}`}
          className="flex items-center justify-between gap-4 py-1"
        >
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.stroke }}
            />
            <span className="text-sm font-medium text-popover-foreground">
              {entry.name}
            </span>
          </div>
          <span className="text-sm font-medium text-popover-foreground">
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export function FinancialAreaChart() {
  const [timeRange, setTimeRange] = React.useState("90d");
  const [allChartData, setAllChartData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [visibleMetrics, setVisibleMetrics] = React.useState({
    income: true,
    expense: true,
    balance: true,
  });

  // Fetch chart data from server
  useEffect(() => {
    async function fetchChartData() {
      try {
        setIsLoading(true);
        const data = await getFinancialChartData(365); // Get a full year of data
        setAllChartData(data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChartData();
  }, []);

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (!allChartData.length) return [];

    const today = new Date();
    let daysToSubtract: number;

    switch (timeRange) {
      case "7d":
        daysToSubtract = 7;
        break;
      case "30d":
        daysToSubtract = 30;
        break;
      case "90d":
        daysToSubtract = 90;
        break;
      case "180d":
        daysToSubtract = 180;
        break;
      case "365d":
        daysToSubtract = 365;
        break;
      default:
        daysToSubtract = 90;
    }

    const startDate = new Date();
    startDate.setDate(today.getDate() - daysToSubtract);
    const startDateStr = startDate?.toISOString().split("T")[0] || "";

    return allChartData.filter(
      (item) => item.date && item.date >= startDateStr,
    );
  }, [timeRange, allChartData]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const toggleMetric = (metric: "income" | "expense" | "balance") => {
    setVisibleMetrics((prev) => {
      // Prevent unchecking the last visible metric
      const newVisibility = { ...prev, [metric]: !prev[metric] };
      const visibleCount = Object.values(newVisibility).filter(Boolean).length;
      return visibleCount === 0 ? prev : newVisibility;
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="mt-2 h-4 w-60" />
            </CardDescription>
          </div>
          <Skeleton className="h-10 w-[180px]" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="mb-4 flex items-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex items-center">
                  <Skeleton className="mr-1.5 h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-[350px] w-full">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <Skeleton className="h-full w-full rounded-lg opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>
            Track your income, expenses and balance over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]" aria-label="Select time range">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="180d">Last 6 months</SelectItem>
            <SelectItem value="365d">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="income"
              checked={visibleMetrics.income}
              onCheckedChange={() => toggleMetric("income")}
              className="border-[#22c55e] data-[state=checked]:border-[#22c55e] data-[state=checked]:bg-[#22c55e]"
            />
            <Label
              htmlFor="income"
              className="flex items-center text-sm font-medium"
            >
              Income
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="expense"
              checked={visibleMetrics.expense}
              onCheckedChange={() => toggleMetric("expense")}
              className="border-[#ef4444] data-[state=checked]:border-[#ef4444] data-[state=checked]:bg-[#ef4444]"
            />
            <Label
              htmlFor="expense"
              className="flex items-center text-sm font-medium"
            >
              Expense
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="balance"
              checked={visibleMetrics.balance}
              onCheckedChange={() => toggleMetric("balance")}
              className="border-[#3b82f6] data-[state=checked]:border-[#3b82f6] data-[state=checked]:bg-[#3b82f6]"
            />
            <Label
              htmlFor="balance"
              className="flex items-center text-sm font-medium"
            >
              Balance
            </Label>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="flex h-[350px] w-full items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              No financial data available for the selected period
            </p>
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    if (!value) return "";
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  minTickGap={30}
                />
                <YAxis tickFormatter={formatCurrency} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                {visibleMetrics.income && (
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    fill="url(#colorIncome)"
                    name="Income"
                  />
                )}
                {visibleMetrics.expense && (
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    fill="url(#colorExpense)"
                    name="Expense"
                  />
                )}
                {visibleMetrics.balance && (
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#3b82f6"
                    fill="url(#colorBalance)"
                    name="Balance"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
