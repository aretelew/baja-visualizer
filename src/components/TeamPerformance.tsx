"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import bajaData from "../../baja-data.json"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { BajaRadarChart } from "./BajaRadarChart"

interface Team {
  Overall: {
    School: string;
    team_key: string;
    "Overall (1000)": number;
  };
}

export function TeamPerformance({ selectedSchool, selectedCompetition: currentCompetition }: { selectedSchool: string, selectedCompetition: string }) { 

  const allCompetitions = useMemo(() => {
    return Object.keys(bajaData).reverse();
  }, []);

  // Get performance data for the selected team across all competitions
  const chartData = useMemo(() => {
    if (!selectedSchool) return [];
    return allCompetitions.map(comp => {
      const teams = bajaData[comp as keyof typeof bajaData];
      const teamData = Object.values(teams).find((t: Team) => t.Overall && t.Overall.School === selectedSchool);
      const yearMatch = comp.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : null;
      return {
        competition: comp,
        score: teamData ? teamData.Overall["Overall (1000)"] : null,
        year: year,
        team_key: teamData ? teamData.Overall.team_key : null,
        fullData: teamData,
      };
    });
  }, [selectedSchool, allCompetitions]);

  // For team stats, we only consider competitions they participated in.
  const teamPerformance = useMemo(() => chartData.filter(d => d.score !== null), [chartData]);

  const [selectedCompetition, setSelectedCompetition] = useState<{ competition: string; score: number | null; year: string | null; team_key: string | null; fullData: Team | { Overall: { School: string; team_key: string; "Overall (1000)": number; }; }; } | undefined>();

  useEffect(() => {
    if (currentCompetition) {
        const comp = teamPerformance.find(p => p.competition === currentCompetition);
        setSelectedCompetition(comp);
    }
  }, [currentCompetition, teamPerformance]);

  // Calculate team statistics from filtered data
  const scores = teamPerformance.map((p) => p.score) as number[]
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
      {/* Performance Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Score progression for {selectedSchool}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{}}
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
                <ChartTooltip content={<ChartTooltipContent
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div>
                          <p>{label}</p>
                          <p className="text-muted-foreground">{data.team_key}</p>
                        </div>
                      )
                    }
                    return label;
                  }}
                />} />
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

      {/* Radar Chart */}
      <div className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight text-white">Event Scores</h2>
            <p className="text-sm text-muted-foreground pt-2">Scores for {selectedCompetition?.competition}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-6">
          {selectedCompetition?.fullData?.Overall && <BajaRadarChart overallData={selectedCompetition.fullData.Overall} />}
          <Card className="bg-card border-border" />
        </div>
      </div>
    </div>
  )
}