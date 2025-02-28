import { auth } from "~/server/auth";
import { getCurrentUserMetrics } from "./getCurrentUserLeagueData";

export const LEAGUE_OFFERS = {
  0: [
    "5% Cashback on Supermarket Purchases",
    "5% Discount on Electricity and Water Bills",
    "10% discount on Gym memberships",
    "Free Coffee at Partner Cafés (once a month)",
  ],
  1: [
    "7% Cashback on Restaurant Bills",
    "Free Movie Ticket (once a month at partner cinemas)",
    "Annual Health Checkup Package",
    "50% Discount on Monthly Streaming Subscription",
  ],
  2: [
    "10% Cashback on Fashion and Electronics Purchases",
    "24/7 Priority Customer Support",
    "Travel Insurance up to $5000 per trip",
    "SUPERMARKET SALES UP TO 70%",
  ],
  3: [
    "15% Cashback on Flight and Hotel Bookings",
    "Free 3 month Gym membership",
    "5 free rides with Traveling sponsor",
    "Free weekly meal at a fine dining resturant",
  ],
  4: [
    "40% Cashback on All Online and Offline Purchases",
    "1 Year Free Gym membership",
    "Exclusive Private Banking Services",
    "Concert Invitation to LeagueWallets Premium clientele Events ",
  ],
} as const;

export type League = keyof typeof LEAGUE_OFFERS;

function getRandomOffer(offers: readonly string[]): string {
  const randomIndex = Math.floor(Math.random() * offers.length);
  return offers[randomIndex] ?? "";
}

export async function getUserOffer(): Promise<{
  league: League;
  offer: string;
} | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const metrics = await getCurrentUserMetrics();

    // meow
    const response = await fetch(
      "https://3b8a-196-132-53-64.ngrok-free.app/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metrics),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get league prediction");
    }

    const prediction = await response.json();
    const league = prediction.cluster as League;
    const randomOffer = getRandomOffer(LEAGUE_OFFERS[league]);

    return {
      league,
      offer: randomOffer,
    };
  } catch (error) {
    console.error("Error getting user league:", error);
    return null;
  }
}
