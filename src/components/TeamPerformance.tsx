"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import bajaData from "../../baja-data.json"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function TeamPerformance() {
  const [selectedTeam, setSelectedTeam] = useState("CWRU Motorsports")

  // Get all unique teams
  const allTeams = Array.from(
    new Set(
      Object.values(bajaData)
        .flat()
        .map((t) => t.Canonical_Team),
    ),
  ).sort()

  const teamOptions = allTeams.map((team) => ({
    value: team,
    label: team,
  }))

  // Chronological list of all competitions
  const allCompetitions = Object.keys(bajaData).reverse();

  // Get performance data for the selected team across all competitions
  const chartData = allCompetitions.map(comp => {
    const teams = bajaData[comp];
    const teamData = teams.find(t => t.Canonical_Team === selectedTeam);
    const yearMatch = comp.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : null;
    return {
      competition: comp,
      score: teamData ? teamData["Overall (1000)"] : null,
      year: year,
    };
  });

  // For team stats, we only consider competitions they participated in.
  const teamPerformance = chartData.filter(d => d.score !== null);

  // Calculate team statistics from filtered data
  const scores = teamPerformance.map((p) => p.score)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0
  const minScore = scores.length > 0 ? Math.min(...scores) : 0

  const yearTicks = [];
  const displayedYears = new Set();
  for (const d of teamPerformance) {
    const year = d.year;
    if (year && !displayedYears.has(year)) {
      yearTicks.push(d.competition);
      displayedYears.add(year);
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Selector */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Select Team</CardTitle>
          <CardDescription>View performance history for any team</CardDescription>
        </CardHeader>
        <CardContent>
          <Combobox
            options={teamOptions}
            value={selectedTeam}
            onChange={setSelectedTeam}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Team Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardDescription>Competitions</CardDescription>
            <CardTitle className="text-2xl">{teamPerformance.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-2xl">{avgScore.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardDescription>Best Score</CardDescription>
            <CardTitle className="text-2xl">{maxScore.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardDescription>Lowest Score</CardDescription>
            <CardTitle className="text-2xl">{minScore.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      {/* Performance Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Score progression across competitions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              score: {
                label: "Score",
                color: "var(--chart-1)",
              },
            }}
            className="h-[400px] w-full px-4"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="competition" 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  ticks={yearTicks}
                  tickFormatter={(tick) => {
                    const yearMatch = tick.match(/\d{4}/);
                    return yearMatch ? yearMatch[0] : '';
                  }}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 1000]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}