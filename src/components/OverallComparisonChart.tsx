"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import bajaData from "../../baja-data.json"

interface Team {
  token: string
  competition: string
  school: string
  teamKey: string
}

interface OverallComparisonChartProps {
  teams: Team[]
}

type TeamData = { 
  Overall: Record<string, unknown>
  Acceleration?: Record<string, unknown>
}
type CompetitionData = Record<string, TeamData>
type BajaData = Record<string, CompetitionData>

const ACCEL_KEYS = ["Score", "Acceleration Score (75)", "Acceleration"] 

function getValue(teamData: TeamData, possibleKeys: string[]): number {
  // Try specific Acceleration section first
  const accel = teamData?.Acceleration
  if (accel) {
    for (const key of possibleKeys) {
      const val = accel[key]
      if (typeof val === "number") return val
    }
  }

  // Fallback to Overall section
  const overall = teamData?.Overall
  if (overall) {
    // Check for keys like "Acceleration (75)"
    const overallKeys = ["Acceleration (75)", ...possibleKeys]
    for (const key of overallKeys) {
      const val = overall[key]
      if (typeof val === "number") return val
    }
  }
  
  return 0
}

function resolveCompetitionData(competitionKey: string): CompetitionData | null {
  const dataAny = bajaData as BajaData
  if (dataAny[competitionKey]) return dataAny[competitionKey]
  const trimmed = competitionKey.trim()
  if (dataAny[trimmed]) return dataAny[trimmed]
  return null
}

function findTeamData(competitionData: CompetitionData, teamKey: string): TeamData | null {
  if (!competitionData) return null
  const values = Object.values(competitionData)
  let found = values.find((t) => t?.Overall?.team_key === teamKey)
  if (!found) {
     const trimmed = teamKey.trim()
     found = values.find((t) => (t?.Overall?.team_key as string)?.trim() === trimmed)
  }
  return found || null
}

function stringToColor(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `${hue} 70% 50%`
}

function extractTeamName(teamKey: string): string {
  const parts = teamKey.split(" - ").map((p) => p.trim()).filter(Boolean)
  return parts.length > 1 ? parts.slice(1).join(" - ") : parts[0] || teamKey
}

export function OverallComparisonChart({ teams }: OverallComparisonChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    teams.forEach((team) => {
      config[team.token] = {
        label: `${extractTeamName(team.teamKey)} (${team.competition})`,
        color: `hsl(${stringToColor(team.token)})`,
      }
    })
    return config
  }, [teams])

  const chartData = useMemo(() => {
    return teams.map((team) => {
      let score = 0
      const compData = resolveCompetitionData(team.competition)
      if (compData) {
        const teamData = findTeamData(compData, team.teamKey)
        if (teamData) {
          score = getValue(teamData, ACCEL_KEYS)
        }
      }
      
      return {
        teamName: extractTeamName(team.teamKey),
        score,
        token: team.token,
        fill: `hsl(${stringToColor(team.token)})`,
      }
    })
  }, [teams])

  if (teams.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acceleration Points</CardTitle>
        <CardDescription>Comparing Acceleration event scores.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="teamName"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickMargin={10}
              label={{ value: "Points", angle: -90, position: 'insideLeft' }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="score" radius={4}>
              {chartData.map((entry) => (
                <Cell key={entry.token} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
