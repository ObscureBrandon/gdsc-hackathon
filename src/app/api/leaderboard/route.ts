import { getUserMetrics } from "~/server/actions/getUserMetrics";

export async function GET() {
  try {
    // Get user metrics
    const userMetrics = await getUserMetrics();
    console.log(userMetrics);

    // Call external API for predictions
    const response = await fetch(
      "https://5a6b-156-213-248-243.ngrok-free.app/predict-batch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: userMetrics }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get predictions");
    }

    const predictions = await response.json();
    return Response.json(predictions);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return Response.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 },
    );
  }
}
