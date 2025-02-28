import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";
import { getUserFinancialSummary } from "~/server/actions/getUserFinancialSummary";
import { auth } from "~/server/auth";

const geminiModel = google("gemini-2.0-flash-001");

// Schema for chart data
const ChartDataSchema = z
  .object({
    type: z.enum(["bar", "line", "area"]),
    title: z.string(),
    data: z.array(
      z.object({
        name: z.string(),
        value: z.number(),
      }),
    ),
    description: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    total: data.data.reduce((sum, item) => sum + item.value, 0),
  }));

const tools = {
  createChart: {
    description:
      "Create a chart visualization for financial data. Use this tool to visualize numerical data in bar, line, or area charts.",
    parameters: ChartDataSchema,
    execute: async (params: z.infer<typeof ChartDataSchema>) => {
      // This would typically fetch real data or perform calculations
      // For now, returning the params as-is
      return params;
    },
    handler: async (params: z.infer<typeof ChartDataSchema>) => {
      const chartData = await tools.createChart.execute(params);
      return `\`\`\`chart
${JSON.stringify(chartData, null, 2)}
\`\`\``;
    },
  },
};

const systemPrompt = `You are a helpful financial advisor that uses charts to visualize data. When discussing financial data, always use the createChart tool to visualize the information.

Chart Type Selection Guidelines:
1. Use "bar" charts for:
   - Category comparisons (e.g., expense categories)
   - Side-by-side comparisons
   - When exact values are important

2. Use "line" charts for:
   - Showing trends over time
   - Multiple series that need comparison
   - When the focus is on rate of change
   - Monthly totals or running balances

3. Use "area" charts for:
   - Showing cumulative values over time
   - Displaying parts of a whole
   - Emphasizing the magnitude of change
   - When showing volume or accumulation is important

The user's financial data includes:
- Monthly totals for income, expenses, and savings
- Category breakdowns with historical trends
- Transaction patterns and spending behavior

Always choose the most appropriate chart type for the data being presented. For example:
- For "What are my biggest expenses?" use a bar chart
- For "How has my spending changed over time?" use a line chart
- For "Show me my savings accumulation" use an area chart

Respond in a conversational way and explain the insights revealed by the charts.`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    // Get user's financial summary
    const financialSummary = await getUserFinancialSummary(session.user.id);

    // Format monthly totals for better readability
    const monthlyData = financialSummary?.trends.monthlyTotals
      .map((month) => ({
        ...month,
        month: new Date(month.month).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      }))
      .reverse(); // Most recent first

    // Format category trends for better readability
    const categoryTrends = financialSummary?.trends.categoryTrends.map(
      (trend) => ({
        ...trend,
        values: trend.values.map((v) => ({
          ...v,
          month: new Date(v.month).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        })),
      }),
    );

    // Add financial context to the system message
    const systemMessage = {
      role: "system",
      content: `${systemPrompt}\nThe user's current financial status is:
        - Current Balance: $${financialSummary?.currentBalance.toFixed(2)}
        - Monthly Income: $${financialSummary?.monthlyStats.income.toFixed(2)}
        - Monthly Expenses: $${financialSummary?.monthlyStats.expenses.toFixed(2)}
        - Monthly Savings: $${financialSummary?.monthlyStats.savings.toFixed(2)}
        - Savings Rate: ${financialSummary?.trends.savingsRate.toFixed(1)}%
        
        Top expense categories:
        ${financialSummary?.trends.expenseBreakdown
          .map(
            (cat) =>
              `- ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)`,
          )
          .join("\n")}
        
        Monthly Trends (Last 6 Months):
        ${monthlyData
          ?.map(
            (m) =>
              `- ${m.month}: Income: $${m.income.toFixed(2)}, Expenses: $${m.expenses.toFixed(
                2,
              )}, Savings: $${m.savings.toFixed(2)}`,
          )
          .join("\n")}
        
        Category Spending Trends:
        ${categoryTrends
          ?.map(
            (cat) =>
              `${cat.category}:\n${cat.values
                .map((v) => `  - ${v.month}: $${Number(v.amount).toFixed(2)}`)
                .join("\n")}`,
          )
          .join("\n\n")}
        
        Risk Indicators:
        - Large Expenses: ${financialSummary?.riskMetrics.largeExpenses}
        - Days Since Last Income: ${financialSummary?.riskMetrics.daysSinceLastIncome}
        
        Use this data to create appropriate visualizations:
        - For spending categories, use bar charts
        - For monthly trends (income/expenses/savings), use line charts
        - For cumulative savings or category accumulation, use area charts
        
        Provide personalized financial advice based on this data.`,
    };

    console.log(systemMessage);

    // Add system message to the beginning of the conversation
    const enrichedMessages = [systemMessage, ...messages];

    const result = streamText({
      model: geminiModel,
      messages: enrichedMessages,
      tools,
    });

    return result.toDataStreamResponse({});
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
