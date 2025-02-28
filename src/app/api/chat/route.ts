import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";

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

const systemPrompt = `You are a helpful financial advisor that uses charts to visualize data. When discussing financial data, always use the createChart tool to visualize the information. For example, when discussing spending habits, create a bar chart showing the breakdown. When discussing trends, use a line or area chart.

Example usage of createChart:
- For spending breakdowns: type "bar", with categories and their values
- For trends over time: type "line" or "area", with time periods and values
- Always include a descriptive title and description

Respond in a conversational way and explain the charts you create.`;

export async function POST(request: Request) {
  const { messages } = await request.json();
  const result = streamText({
    model: geminiModel,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    tools,
  });

  return result.toDataStreamResponse({});
}
