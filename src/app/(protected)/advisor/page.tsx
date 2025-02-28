"use client";

import { useChat } from "@ai-sdk/react";
import { SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
      // Existing chart rendering code...
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
  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat({
      api: "/api/chat",
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState("calc(70vh - 100px)");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Calculate available height on component mount
  useEffect(() => {
    const updateHeight = () => {
      // Adjust these values based on your layout
      // Account for the fixed navbar (16px) and other elements
      const headerHeight = 80; // CardHeader
      const inputHeight = 60; // Input area
      const padding = 40; // Padding/margins
      const navbarHeight = 64; // Height of the navbar (16px * 4)

      setChatHeight(
        `calc(80vh - ${headerHeight + inputHeight + padding + navbarHeight}px)`,
      );
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Handle example prompt click
  const handleExampleClick = (promptText: string) => {
    // Set the input first
    setInput(promptText);

    // Then submit programmatically after a small delay to ensure input is set
    setTimeout(() => {
      // Create and dispatch a submit event on the form
      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", {
          cancelable: true,
          bubbles: true,
        });
        form.dispatchEvent(submitEvent);
      }
    }, 100);
  };

  // Example prompts data
  const examplePrompts = [
    "What are my biggest expenses this month?",
    "How can I reduce my spending on restaurants?",
    "Create a budget plan for me",
  ];

  return (
    <div className="container mx-auto p-4 py-6">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col items-center gap-2">
            Your Friendly Neighborhood Financial AI Advisor
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-spider"
            >
              <path d="M10 5v1" />
              <path d="M14 6V5" />
              <path d="M10 10.4V8a2 2 0 1 1 4 0v2.4" />
              <path d="M7 15H4l-2 2.5" />
              <path d="M7.42 17 5 20l1 2" />
              <path d="m8 12-4-1-2-3" />
              <path d="M9 11 5.5 6 7 2" />
              <path d="M8 18a5 5 0 1 1 8 0s-2 3-4 4c-2-1-4-4-4-4" />
              <path d="m15 11 3.5-5L17 2" />
              <path d="m16 12 4-1 2-3" />
              <path d="M17 15h3l2 2.5" />
              <path d="M16.57 17 19 20l-1 2" />
            </svg>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="pr-4" style={{ height: chatHeight }}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <p>
                    Ask me questions about your finances, spending habits, or
                    how to save money.
                  </p>
                  <div className="mt-6 space-y-2">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(prompt)}
                        className="mx-1 w-fit rounded-md bg-muted/50 p-2 text-center text-sm transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything about your finances..."
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim()}>
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
