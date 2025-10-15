"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A radar chart showing event scores for a team."

interface OverallData {
  "School": string;
  "Rank": number;
  "Business Presentation (50)": number;
  "Cost Event (100)": number;
  "Design (150)": number;
  "Acceleration (75)": number;
  "Maneuverability (75)": number;
  "Hill Climb (75)": number;
  "Suspension & Traction (75)": number;
  "Endurance (400)": number;
}

interface BajaRadarChartProps {
  overallData: OverallData;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function BajaRadarChart({ overallData }: BajaRadarChartProps) {
          const excludedKeys = [
    "School",
    "Rank",
    "Overall (1000)",
    "Overall Dynamic (300)",
    "Overall Static (300)",
    "Cost Event (100)",
    "Design (150)",
    "Business Presentation (50)",
    "team_key",
    "Registered",
    "Passed Tech",
    "Passed Tech On Time",
    "Public Comments",
    "Adjustments",
    "Sales Presentation (50)",
  ];

  const chartData = Object.keys(overallData)
    .filter(key => !excludedKeys.includes(key) && key.includes(" ("))
    .map(key => {
      const eventName = key.substring(0, key.indexOf(" (")).replace(" & Traction", "");
      const maxScoreMatch = key.match(/\((\d+)\)/);
      if (!maxScoreMatch) return null;

      const maxScore = parseInt(maxScoreMatch[1], 10);
      const score = overallData[key as keyof OverallData] as number;

      if (typeof score === 'number') {
        return {
          event: eventName,
          score: (score / maxScore) * 100,
        };
      }
      return null;
    })
    .filter((item): item is { event: string; score: number } => item !== null);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>{overallData.School}</CardTitle>
        <CardDescription>
          Normalized Event Score Breakdown (Rank: {overallData.Rank})
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="event" />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground">
          Scores are normalized to a 0-100 scale for comparison.
        </div>
      </CardFooter>
    </Card>
  )
}
