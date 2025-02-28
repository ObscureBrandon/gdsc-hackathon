import type React from "react";
import { cn } from "~/lib/utils";

interface ChartProps {
  data: { name: string; [key: string]: number | string }[];
  index: string;
  categories: string[];
  colors: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const AreaChart: React.FC<ChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  className,
}) => {
  return (
    <div className={cn("rounded-md p-2 text-slate-300", className)}>
      {/* Placeholder for AreaChart */}
      <div className="my-2 font-medium">Monthly Income</div>
      <div className="flex h-48 items-end space-x-2">
        {data.map((item, i) => (
          <div
            key={i}
            className="group relative flex flex-1 flex-col items-center"
          >
            <div
              className="w-full bg-primary/70 transition-all group-hover:bg-primary"
              style={{
                height: `${(Number(item.total) / 3200) * 100}%`,
              }}
            ></div>
            <span className="mt-1 text-xs">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BarChart: React.FC<ChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  className,
}) => {
  return (
    <div className={cn("rounded-md p-2 text-slate-300", className)}>
      {/* Placeholder for BarChart */}
      <div className="my-2 font-medium">Weekly Spending</div>
      <div className="flex h-48 items-end space-x-2">
        {data.map((item, i) => (
          <div
            key={i}
            className="group relative flex flex-1 flex-col items-center"
          >
            <div
              className="w-full bg-lime-500/70 transition-all group-hover:bg-lime-500"
              style={{
                height: `${(Number(item.total) / 320) * 100}%`,
              }}
            ></div>
            <span className="mt-1 text-xs">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LineChart: React.FC<ChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  className,
}) => {
  return (
    <div className={cn("rounded-md p-2 text-slate-300", className)}>
      {/* Placeholder for LineChart */}
      <div className="my-2 font-medium">Monthly Savings</div>
      <div className="flex h-48 items-end">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={data
              .map(
                (item, i) =>
                  `${(i / (data.length - 1)) * 100},${100 - (Number(item.value) / 800) * 100}`,
              )
              .join(" ")}
            fill="none"
            stroke="hsl(var(--chart-1))"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};
