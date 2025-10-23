
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useMemo } from "react";
import bajaData from "../../baja-data.json";

interface Team {
  token: string;
  competition: string;
  school: string;
  teamKey: string;
}

interface CategoryPerformanceComparisonProps {
  teams: Team[];
}

const EVENT_CATEGORIES = [
  "Acceleration",
  "Suspension",
  "Maneuverability",
  "Hill Climb",
  "Rock Crawl",
  "Endurance",
];

const EVENT_POINTS: { [key: string]: number } = {
  "Acceleration": 75,
  "Suspension": 75,
  "Maneuverability": 75,
  "Hill Climb": 75,
  "Rock Crawl": 75,
  "Sled Pull": 75,
  "Endurance": 400,
};

function getScore(teamData: any, category: string): number {
  if (!teamData) return 0;

  // The category names in the JSON data are sometimes different from the ones we use
  let categoryKey = category;
  if (category === "Suspension") {
    categoryKey = "Suspension & Traction";
  }

  const categoryData = teamData[categoryKey];
  if (!categoryData) return 0;

  let score = 0;
  if (category === "Endurance") {
    score = categoryData["Points (400)"] || 0;
  } else {
    score = categoryData.Score || categoryData.score || 0;
  }

  const maxPoints = EVENT_POINTS[category];
  if (!maxPoints) return 0;

  return (score / maxPoints) * 100;
}

export function CategoryPerformanceComparison({ teams = [] }: CategoryPerformanceComparisonProps) {
  const chartData = useMemo(() => {
    if (teams.length === 0) {
      return EVENT_CATEGORIES.map(category => ({ category }));
    }

    return EVENT_CATEGORIES.map(category => {
      const entry: { [key: string]: string | number } = { category };
      teams.forEach(team => {
        // Some competition keys in the dataset may have trailing spaces or alternate spellings
        const competitionData = (bajaData as any)[team.competition] ?? (bajaData as any)[team.competition.trim()];
        if (competitionData) {
          const teamData = Object.values(competitionData).find((t: any) => t.Overall.team_key === team.teamKey);
          const rawScore = getScore(teamData, category);
          const cappedScore = Math.min(rawScore, 100);
          const overflowAmount = Math.max(0, rawScore - 100);
          entry[team.token] = cappedScore;
          entry[`${team.token}__overflow`] = overflowAmount;
        } else {
          entry[team.token] = 0;
          entry[`${team.token}__overflow`] = 0;
        }
      });
      return entry;
    });
  }, [teams]);

  const chartConfig = useMemo(() => {
    const config: { [key: string]: { label: string, color: string } } = {};
    teams.forEach(team => {
      const competitionLabel = team.competition.trim();
      config[team.token] = {
        label: `${extractTeamName(team.teamKey)} - ${team.school} - ${competitionLabel}`,
        color: `hsl(${stringToColor(team.token)})`,
      };
    });
    return config;
  }, [teams]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart data={chartData} margin={{ top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <ChartLegend content={((props: any) => <ChartLegendContent {...props} />) as any} />
        {teams.map((team) => (
          <Bar key={team.token} dataKey={team.token} fill={chartConfig[team.token]?.color} radius={4}>
            <LabelList content={(props: any) => (
              <OverflowMarker
                {...props}
                teamToken={team.token}
                color={chartConfig[team.token]?.color}
              />
            )} />
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function OverflowMarker(props: any & { teamToken: string; color: string }) {
  const { x, y, width, payload, teamToken, color } = props;
  const overflowAmount = (payload?.[`${teamToken}__overflow`] ?? 0) as number;
  if (!overflowAmount || x == null || y == null || width == null) return null;

  const centerX = x + width / 2;
  const markerHeight = 8;
  const markerWidth = 10;
  const offset = 4; // small gap above the bar top

  const pathD = `M ${centerX} ${y - offset} l ${markerWidth / 2} ${markerHeight} l -${markerWidth} 0 z`;

  return (
    <g pointerEvents="none">
      <path d={pathD} fill={color} />
    </g>
  );
}

function stringToColor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `${hue}, 70%, 50%`;
}

function extractTeamName(teamKey: string): string {
  // team_key is typically "School - Team Name" or "School - Campus - Team Name".
  // We treat the last segment as the team name.
  const parts = teamKey.split(" - ").map((p) => p.trim()).filter(Boolean)
  return parts.length > 1 ? parts.slice(1).join(" - ") : parts[0] || teamKey;
}
