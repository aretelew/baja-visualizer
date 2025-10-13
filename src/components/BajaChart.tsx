"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import bajaData from "../../baja-data.json"

const chartConfig = {
  points: {
    label: "Points",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const competitions = Object.keys(bajaData);

export function BajaChart() {
  const [activeCompetition, setActiveCompetition] = React.useState(competitions[0])

  const chartData = React.useMemo(() => {
    const competitionData = bajaData[activeCompetition as keyof typeof bajaData];
    if (!competitionData) return [];
    return Object.values(competitionData)
      .filter((team: any) => team && team.Overall)
      .map((team: any) => ({
        team: team.Overall.School,
        points: team.Overall["Overall (1000)"],
      }))
      .sort((a, b) => b.points - a.points);
  }, [activeCompetition]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Baja SAE Results</CardTitle>
          <CardDescription>
            Top teams ranked by points
          </CardDescription>
        </div>
        <Select value={activeCompetition} onValueChange={setActiveCompetition}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Competition" />
          </SelectTrigger>
          <SelectContent>
            {competitions.map(comp => (
              <SelectItem key={comp} value={comp}>{comp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[800px] bg-transparent">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap={2}
          >
            <CartesianGrid horizontal={false} stroke="var(--color-border)" />
            <XAxis type="number" dataKey="points" stroke="var(--color-muted-foreground)" />
            <YAxis
              type="category"
              dataKey="team"
              width={150}
              tickLine={false}
              axisLine={false}
              stroke="var(--color-muted-foreground)"
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="points" fill="var(--color-points)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
