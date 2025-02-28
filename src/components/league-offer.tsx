"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getUserOffer } from "~/server/actions/getUserOffer";

export async function LeagueOffer() {
  const leagueInfo = await getUserOffer();

  if (!leagueInfo) return null;

  const leagueImages = {
    0: "./bronze.png",
    1: "./silver.png",
    2: "./golden.png",
    3: "./plat.png",
    4: "./diamond.png",
  };

  return (
    <Card className="bg-gradient-to-r from-muted/50 to-background">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
          {/* <Image
            src={leagueImages[leagueInfo.league]}
            alt={`${leagueInfo.league} league`}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          /> */}
        </div>
        <div>
          <CardTitle className="text-xl">
            {leagueInfo.league} League Member
          </CardTitle>
          <CardDescription>Exclusive offer available for you</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-4 text-primary">
          {/* <GiftIcon className="h-5 w-5 shrink-0" /> */}
          <p className="text-sm font-medium">{leagueInfo.offer}</p>
        </div>
      </CardContent>
    </Card>
  );
}
