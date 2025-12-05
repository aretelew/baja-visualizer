"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import bajaData from "@/data/baja-data-final-sanitized.json"

export function TeamPerformance() {
  const [selectedTeam, setSelectedTeam] = useState("Cornell Baja Racing")

  // Get all unique teams
  const allTeams = Array.from(
    new Set(
      Object.values(bajaData)
        .flat()
        .map((t) => t.Canonical_Team),
    ),
  ).sort()

  // Get performance data for selected team
  const teamPerformance = Object.entries(bajaData)
    .map(([comp, teams]) => {
      const team = teams.find((t) => t.Canonical_Team === selectedTeam)
      return team
        ? {
            competition: comp.split(" ")[0],
            score: team["Overall (1000)"],
            fullName: comp,
          }
        : null
    })
    .filter(Boolean)
    .reverse()

  // Calculate team statistics
  const scores = teamPerformance.map((p) => p!.score)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0
  const minScore = scores.length > 0 ? Math.min(...scores) : 0

  return (
    <div className="space-y-6">
      {/* Team Selector */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Select Team</CardTitle>
          <CardDescription>View performance history for any team</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allTeams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <CardContent>
          <ChartContainer
            config={{
              score: {
                label: "Score",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={teamPerformance}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="competition" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 1000]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Competition Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Competition Details</CardTitle>
          <CardDescription>Complete performance record</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamPerformance.map((perf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-4 py-3"
              >
                <span className="text-sm font-medium">{perf!.fullName}</span>
                <span className="text-sm font-mono">{perf!.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
