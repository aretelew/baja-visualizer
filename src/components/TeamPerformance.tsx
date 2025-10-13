"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import bajaData from "../../baja-data.json"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function TeamPerformance() {
  const teamOptions = useMemo(() => {
    const schoolData: { [schoolName: string]: { recentTeamName: string; recentCompetitionYear: number } } = {};
    const competitionKeys = Object.keys(bajaData).sort();

    for (const competition of competitionKeys) {
      const competitionYearMatch = competition.match(/\d{4}/);
      const competitionYear = competitionYearMatch ? parseInt(competitionYearMatch[0]) : 0;

      const competitionData = bajaData[competition as keyof typeof bajaData];
      for (const team of Object.values(competitionData)) {
        if (team && team.Overall && team.Overall.School && team.Overall.team_key) {
          const schoolName = team.Overall.School;
          const teamName = team.Overall.team_key;

          if (!schoolData[schoolName]) {
            schoolData[schoolName] = { recentTeamName: '', recentCompetitionYear: 0 };
          }

          if (competitionYear >= schoolData[schoolName].recentCompetitionYear) {
            schoolData[schoolName].recentCompetitionYear = competitionYear;
            schoolData[schoolName].recentTeamName = teamName;
          }
        }
      }
    }

    return Object.values(schoolData)
      .map(data => ({
        value: data.recentTeamName,
        label: data.recentTeamName,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const [selectedTeam, setSelectedTeam] = useState(() => {
    const targetTeam = teamOptions.find(option => option.label === "Case Western Reserve University - CWRU Motorsports");
    return targetTeam ? targetTeam.value : (teamOptions[0]?.value || "");
  })

  const selectedSchool = useMemo(() => {
    if (!selectedTeam) return null;
    for (const competition in bajaData) {
      const competitionData = bajaData[competition as keyof typeof bajaData];
      for (const team of Object.values(competitionData)) {
        if (team && team.Overall && team.Overall.team_key === selectedTeam) {
          return team.Overall.School;
        }
      }
    }
    return null;
  }, [selectedTeam]);

  // Chronological list of all competitions
  const allCompetitions = useMemo(() => Object.keys(bajaData).reverse(), []);

  // Get performance data for the selected team across all competitions
  const chartData = useMemo(() => {
    if (!selectedSchool) return [];
    return allCompetitions.map(comp => {
      const teams = bajaData[comp as keyof typeof bajaData];
      const teamData = Object.values(teams).find((t: any) => t.Overall && t.Overall.School === selectedSchool);
      const yearMatch = comp.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : null;
      return {
        competition: comp,
        score: teamData ? teamData.Overall["Overall (1000)"] : null,
        year: year,
        team_key: teamData ? teamData.Overall.team_key : null,
      };
    });
  }, [selectedSchool, allCompetitions]);

  // For team stats, we only consider competitions they participated in.
  const teamPerformance = chartData.filter(d => d.score !== null);

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

  const [isExpanded, setIsExpanded] = useState(false);

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

      {/* Competition Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Competition Details</CardTitle>
          <CardDescription>Complete performance record</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(isExpanded ? teamPerformance : teamPerformance.slice(0, 10)).map((perf) => (
              <div
                key={perf.competition}
                className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-4 py-3"
              >
                <span className="text-sm font-medium">{perf.competition}</span>
                <span className="text-sm font-mono">{perf.score!.toFixed(2)}</span>
              </div>
            ))}
          </div>
          {teamPerformance.length > 10 && !isExpanded && (
            <div className="flex justify-center pt-4">
              <Button variant="ghost" onClick={() => setIsExpanded(true)} className="cursor-pointer">
                Show More
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </Button>
            </div>
          )}
          {isExpanded && (
            <div className="flex justify-center pt-4">
              <Button variant="ghost" onClick={() => setIsExpanded(false)} className="cursor-pointer">
                Show Less
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}