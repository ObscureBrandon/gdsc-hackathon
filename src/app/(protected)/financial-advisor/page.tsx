"use client";

import { useChat } from "@ai-sdk/react";
import { SendIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import {
  Area,
  Bar,
  CartesianGrid,
  Line,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartTooltip } from "~/components/ui/chart";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";

// Custom renderer for code blocks
const CodeBlock = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  console.log(className);
  if (className === "chart") {
    try {
      const chartData = JSON.parse(children as string);
      console.log("Rendering chart data:", chartData);
      const { type, title, data, description, total } = chartData;

      const commonConfig = {
        primary: {
          theme: {
            light: "hsl(var(--primary))",
            dark: "hsl(var(--primary))",
          },
        },
      };

      const commonChartProps = {
        width: 500,
        height: 300,
        data,
        margin: { top: 10, right: 30, left: 0, bottom: 0 },
      };

      return (
        <div className="w-full">
          {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
          {description && (
            <p className="mb-4 text-sm text-muted-foreground">{description}</p>
          )}
          <p className="mb-2 text-sm text-muted-foreground">
            Total: ${total.toLocaleString()}
          </p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {type === "bar" ? (
                <RechartsBarChart {...commonChartProps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <ChartTooltip />
                  <Bar
                    dataKey="value"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              ) : type === "line" ? (
                <RechartsLineChart {...commonChartProps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </RechartsLineChart>
              ) : (
                <RechartsAreaChart {...commonChartProps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <ChartTooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RechartsAreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Failed to parse chart data:", error);
      return <pre>{children}</pre>;
    }
  }
  return <pre className={className}>{children}</pre>;
};

export default function FinancialAdvisor() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Financial Advisor AI</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "assistant"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      switch (part.type) {
                        case "tool-invocation":
                          if (part.toolInvocation.toolName === "createChart") {
                            if (part.toolInvocation.state === "result") {
                              return (
                                <div key={index}>
                                  <CodeBlock className="chart">
                                    {JSON.stringify(
                                      part.toolInvocation.result,
                                      null,
                                      2,
                                    )}
                                  </CodeBlock>
                                </div>
                              );
                            }
                          }
                          return null;
                        case "text":
                          return (
                            <Markdown
                              key={index}
                              components={{
                                code: ({ className, children }) => (
                                  <CodeBlock className={className}>
                                    {children}
                                  </CodeBlock>
                                ),
                              }}
                            >
                              {part.text}
                            </Markdown>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything about your finances..."
              className="flex-1"
            />
            <Button type="submit">
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
