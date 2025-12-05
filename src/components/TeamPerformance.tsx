"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import bajaData from "../../baja-data.json"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { BajaDynamicRadarChart } from "./BajaDynamicRadarChart"
import { BajaStaticRadarChart } from "./BajaStaticRadarChart"
import { useChartAnimation } from "@/hooks/useChartAnimation"

type OverallData = {
  "School": string;
  "Rank": number;
  "Business Presentation (50)": number;
  "Sales Presentation (50)"?: number;
  "Cost Event (100)": number;
  "Design (150)": number;
  "Acceleration (75)": number;
  "Maneuverability (75)": number;
  "Hill Climb (75)": number;
  "Suspension & Traction (75)": number;
  "Endurance (400)": number;
};

interface Team {
  Overall: {
    School: string;
    team_key: string;
    "Overall (1000)": number;
  } & Partial<OverallData>;
}

interface CompetitionData {
  competition: string;
  score: number;
  year: string | null;
  team_key: string | null;
  fullData: Team | undefined;
}

export function TeamPerformance({
  selectedSchool,
  selectedCompetition: currentCompetition,
  suppressInitialAnimation = false,
}: {
  selectedSchool: string;
  selectedCompetition: string;
  suppressInitialAnimation?: boolean;
}) { 

  const allCompetitions = useMemo(() => {
    return Object.keys(bajaData).reverse();
  }, []);

  // Get performance data for the selected team across all competitions
  const chartData = useMemo(() => {
    if (!selectedSchool) return [];
    return allCompetitions.map(comp => {
      const teams = bajaData[comp as keyof typeof bajaData];
      const teamData = (Object.values(teams) as Team[]).find(t => t.Overall && t.Overall.School === selectedSchool);
      const yearMatch = comp.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : null;
      return {
        competition: comp,
        score: teamData ? (teamData.Overall["Overall (1000)"] as number) : 0,
        year: year,
        team_key: teamData ? (teamData.Overall.team_key as string) : null,
        fullData: teamData,
      };
    });
  }, [selectedSchool, allCompetitions]);

  // For team stats, we only consider competitions they participated in.
  const teamPerformanceStats = useMemo(() => chartData.filter(d => d.score !== 0), [chartData]);

  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionData | undefined>();
  const animationKey = `${selectedSchool || "none"}-${currentCompetition || "all"}`;
  const shouldAnimate = useChartAnimation(animationKey, suppressInitialAnimation);

  useEffect(() => {
    if (currentCompetition) {
        const comp = teamPerformanceStats.find(p => p.competition === currentCompetition);
        setSelectedCompetition(comp);
    }
  }, [currentCompetition, teamPerformanceStats]);

  // Calculate team statistics from filtered data
  const scores = teamPerformanceStats.map((p) => p.score) as number[]
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0
  const minScore = scores.length > 0 ? Math.min(...scores) : 0

  const yearTicks = [];
  const displayedYears = new Set();
  for (const d of chartData) {
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
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Score progression for {selectedSchool}</CardDescription>
          </div>
          {teamPerformanceStats.length > 0 && (
            <div className="flex flex-wrap justify-end gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="border border-border rounded-md px-3 py-2  flex flex-col items-start gap-1 min-w-[110px]">
                <span className="text-muted-foreground text-[11px] sm:text-xs">
                  Competitions
                </span>
                <span className="font-semibold text-foreground text-sm sm:text-base">
                  {teamPerformanceStats.length}
                </span>
              </div>
              <div className="border border-border rounded-md px-3 py-2 flex flex-col items-start gap-1 min-w-[110px]">
                <span className="text-muted-foreground text-[11px] sm:text-xs">
                  Average Score
                </span>
                <span className="font-semibold text-foreground text-sm sm:text-base">
                  {avgScore.toFixed(1)}
                </span>
              </div>
              <div className="border border-border rounded-md px-3 py-2 flex flex-col items-start gap-1 min-w-[110px]">
                <span className="text-muted-foreground text-[11px] sm:text-xs">
                  Best Score
                </span>
                <span className="font-semibold text-foreground text-sm sm:text-base">
                  {maxScore.toFixed(1)}
                </span>
              </div>
              <div className="border border-border rounded-md px-3 py-2 flex flex-col items-start gap-1 min-w-[110px]">
                <span className="text-muted-foreground text-[11px] sm:text-xs">
                  Lowest Score
                </span>
                <span className="font-semibold text-foreground text-sm sm:text-base">
                  {minScore.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{}}
            className="h-[400px] w-full px-4"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  isAnimationActive={shouldAnimate}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <div className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight text-white">Event Scores</h2>
            <p className="text-sm text-muted-foreground pt-2">Scores for {selectedCompetition?.competition}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
              {selectedCompetition?.fullData?.Overall && (
                <BajaDynamicRadarChart
                  overallData={selectedCompetition.fullData.Overall as OverallData}
                  isAnimationActive={shouldAnimate}
                />
              )}
          </div>
          <div>
              {selectedCompetition?.fullData?.Overall && (
                <BajaStaticRadarChart
                  overallData={selectedCompetition.fullData.Overall as OverallData}
                  isAnimationActive={shouldAnimate}
                />
              )}
          </div>
        </div>
        <div className="text-muted-foreground text-center pt-4">
          Scores are normalized to a 0-100 scale for comparison.
        </div>
      </div>
    </div>
  )
}