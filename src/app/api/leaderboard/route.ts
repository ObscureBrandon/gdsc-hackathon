import { getUserMetrics } from "~/server/actions/getUserMetrics";

// Test data for development
const TEST_DATA = [
  {
    handle: "diamond_player",
    cluster: 4,
    points: 98.5,
  },
  {
    handle: "platinum_user1",
    cluster: 3,
    points: 87.3,
  },
  {
    handle: "platinum_user2",
    cluster: 3,
    points: 85.1,
  },
  {
    handle: "gold_player1",
    cluster: 2,
    points: 76.8,
  },
  {
    handle: "gold_player2",
    cluster: 2,
    points: 72.4,
  },
  {
    handle: "gold_player3",
    cluster: 2,
    points: 70.1,
  },
  {
    handle: "silver_user1",
    cluster: 1,
    points: 65.9,
  },
  {
    handle: "silver_user2",
    cluster: 1,
    points: 62.3,
  },
  {
    handle: "silver_user3",
    cluster: 1,
    points: 58.7,
  },
  {
    handle: "bronze_player1",
    cluster: 0,
    points: 45.2,
  },
  {
    handle: "bronze_player2",
    cluster: 0,
    points: 42.8,
  },
  {
    handle: "bronze_player3",
    cluster: 0,
    points: 38.5,
  },
];

export async function GET() {
  try {
    // For development, return test data
    if (process.env.NODE_ENV === "development") {
      return Response.json(TEST_DATA);
    }

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
