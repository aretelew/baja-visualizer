"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
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

  const [selectedCompetition, setSelectedCompetition] = useState();

  useEffect(() => {
    if (teamPerformance.length > 0) {
      setSelectedCompetition(teamPerformance[teamPerformance.length - 1]);
    }
  }, [teamPerformance]);

  const competitionOptions = useMemo(() => {
    if (!teamPerformance) return [];
    return [...teamPerformance].reverse().map(p => ({
      value: p.competition,
      label: p.competition,
    }));
  }, [teamPerformance]);

  const handleCompetitionChange = (competitionName: string) => {
    const newSelectedCompetition = teamPerformance.find(p => p.competition === competitionName);
    if (newSelectedCompetition) {
      setSelectedCompetition(newSelectedCompetition);
    }
  };

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
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <CardTitle>Team Analytics Dashboard</CardTitle>
              <CardDescription>
                Select a team to view detailed performance metrics
              </CardDescription>
            </div>
            <Combobox
              options={teamOptions}
              value={selectedTeam}
              onChange={setSelectedTeam}
              className="w-[400px]"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Performance Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Score progression for {selectedTeam}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{}}
            className="h-[400px] w-full px-4"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teamPerformance} onClick={(e) => e && e.activePayload && e.activePayload[0] && setSelectedCompetition(e.activePayload[0].payload)}>
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
          <Combobox
            options={competitionOptions}
            value={selectedCompetition?.competition || ""}
            onChange={handleCompetitionChange}
            className="w-[300px]"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-6">
          {selectedCompetition?.fullData?.Overall && <BajaRadarChart overallData={selectedCompetition.fullData.Overall} />}
          <Card className="bg-card border-border" />
        </div>
      </div>
    </div>
  )
}