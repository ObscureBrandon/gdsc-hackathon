/* import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  StreamingTextResponse, 
  Message,
  GoogleGenerativeAIStream 
} from "@vercel/ai";

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateFinancialInsight(
  messages: Message[],
  transactionData?: unknown,
) {
  // Prepare the conversation history for Gemini
  const formattedMessages = messages.map(message => ({
    role: message.role === "user" ? "user" : "model",
    parts: [{ text: message.content }],
  }));

  try {
    // Get the Gemini model (using Flash for quick responses)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Set up the chat session
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1), // All messages except the last one
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    // Get the last message (the user's query)
    const lastMessage = messages[messages.length - 1];
    
    // If transaction data is provided, include it in the prompt
    let prompt = lastMessage.content;
    if (transactionData) {
      prompt = `${prompt}\n\nHere's the relevant transaction data: ${JSON.stringify(transactionData)}`;
    }

    // Generate a response stream
    const result = await chat.sendMessageStream(prompt);
    
    // Return a StreamingTextResponse which handles SSE streaming
    return new StreamingTextResponse(
      GoogleGenerativeAIStream(result),
    );
  } catch (error) {
    console.error("Error generating financial insight:", error);
    throw new Error("Failed to generate financial insight");
  }
}

export async function analyzeTransactions(transactions: unknown) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt = `
    Analyze the following transaction data and identify spending patterns, saving opportunities, 
    and provide financial recommendations:
    
    ${JSON.stringify(transactions)}
    
    Please provide insights in the following JSON format:
    {
      "spendingPatterns": [...],
      "savingOpportunities": [...],
      "recommendations": [...]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse response as JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      // If parsing fails, return the raw text
      return { rawResponse: text };
    }
  } catch (error) {
    console.error("Error analyzing transactions:", error);
    throw new Error("Failed to analyze transactions");
  }
} */