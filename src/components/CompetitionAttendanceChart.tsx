import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import bajaData from "../../baja-data.json"
import { useChartAnimation } from "@/hooks/useChartAnimation"

const chartConfig = {
  teams: {
    label: "Teams",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function CompetitionAttendanceChart({
  suppressInitialAnimation = false,
}: {
  suppressInitialAnimation?: boolean;
}) {
  const shouldAnimate = useChartAnimation("attendance", suppressInitialAnimation);

  // Process data to get team counts per competition
  const chartData = Object.entries(bajaData).map(([competition, teams]) => ({
    competition: competition,
    count: Object.keys(teams).length,
  })).sort((a, b) => {
    // Optional: Sort by year if the competition name contains a year, otherwise alphabetical
    const yearA = a.competition.match(/\d{4}/)?.[0] || ""
    const yearB = b.competition.match(/\d{4}/)?.[0] || ""
    if (yearA && yearB && yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB)
    }
    return a.competition.localeCompare(b.competition)
  })

  const yearTicks = [];
  const displayedYears = new Set();
  for (const d of chartData) {
    const yearMatch = d.competition.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : null;
    if (year && !displayedYears.has(year)) {
      yearTicks.push(d.competition);
      displayedYears.add(year);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competition Attendance</CardTitle>
        <CardDescription>
          Number of teams participating in each competition
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="competition"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              ticks={yearTicks}
              tickFormatter={(value) => {
                const yearMatch = value.match(/\d{4}/);
                return yearMatch ? yearMatch[0] : value;
              }}
            />
             <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={30}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="count"
              type="natural"
              fill="var(--color-teams)"
              fillOpacity={0.4}
              stroke="var(--color-teams)"
              isAnimationActive={shouldAnimate}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
