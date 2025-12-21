"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { SelectedTeam, BajaData } from "@/types/views"
import bajaDataRaw from "../../baja-data.json"
import { stringToColor, extractTeamName } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const bajaData = bajaDataRaw as BajaData

interface AccelerationComparisonChartProps {
  teams: SelectedTeam[]
}

export function AccelerationComparisonChart({ teams }: AccelerationComparisonChartProps) {
  if (teams.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Acceleration Comparison</CardTitle>
                <CardDescription>Select teams to compare acceleration performance.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex items-center justify-center text-muted-foreground">
                No teams selected.
            </CardContent>
        </Card>
    )
  }

  const chartDataEntry: Record<string, any> = { category: "Acceleration" }
  const chartConfig: ChartConfig = {}

  teams.forEach((team, index) => {
    const key = `team_${index}`
    const teamData = bajaData[team.competition]?.[team.teamKey]
    const score = teamData?.Acceleration?.Score || 0
    
    chartDataEntry[key] = score
    
    chartConfig[key] = {
      label: `${extractTeamName(team.teamKey)} (${team.school})`,
      color: `hsl(${stringToColor(team.token)})`,
    }
  })

  const chartData = [chartDataEntry]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acceleration Comparison</CardTitle>
        <CardDescription>Comparing acceleration scores (higher is better).</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {teams.map((team, index) => (
              <Bar
                key={team.token}
                dataKey={`team_${index}`}
                fill={`var(--color-team_${index})`}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
