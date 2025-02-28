/* import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Initialize the Gemini 2.0 model
const model = createGoogleGenerativeAI({
  apiKey: "AIzaSyCha_Bwg877hsIeEi5ol4nmp8xGO8vC0Gc",
});

// Helper function to generate financial insights
export async function generateFinancialInsight(
  prompt: string,
  transactionData?: any,
  userProfile?: any,
): Promise<string> {
  const systemPrompt = `You are LeagueGPT, a financial assistant AI for League Wallet. 
  Your role is to analyze user's financial data and provide helpful insights, budgeting advice, 
  and personalized financial recommendations. Be concise, practical, and friendly.
  
  If the user needs help with budgeting, provide specific actionable advice.
  If the user asks about investment, provide general guidance but remind them you're not a financial advisor.
  Always focus on helping users improve their financial health with practical tips.`;

  // Construct the context with user data if available
  let context = "";
  if (transactionData) {
    context += `\nTransaction history: ${JSON.stringify(transactionData)}`;
  }
  if (userProfile) {
    context += `\nUser profile: ${JSON.stringify(userProfile)}`;
  }

  try {
    // Generate content with system prompt and user data as context
    const { text } = await generateText({
      model: model,
      prompt: `${systemPrompt}\n${context}\n${prompt}`,
    });

    return text;
  } catch (error) {
    console.error("Error generating financial insight:", error);
    return "I'm having trouble analyzing your financial data right now. Please try again later.";
  }
}

// Example usage
(async () => {
  const prompt = "How can I improve my budgeting?";
  const transactionData = {
    expenses: { food: 200, transportation: 100, entertainment: 150 },
    income: 3000,
  };
  const userProfile = { age: 30, financialGoal: "Save for a house" };

  const insight = await generateFinancialInsight(
    prompt,
    transactionData,
    userProfile,
  );
  console.log(insight);
})();
 */