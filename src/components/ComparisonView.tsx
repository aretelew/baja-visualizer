import { CategoryPerformanceComparison } from "./CategoryPerformanceComparison";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import bajaData from "../../baja-data.json"
import { useMemo, useState } from "react"
import { TeamCard } from "./TeamCard"

interface ComparisonViewProps {
  schools: { value: string; label: string }[]
  selectedCompetition: string
  setSelectedCompetition: (competition: string) => void
  selectedSchool: string
  setSelectedSchool: (school: string) => void
}

export function ComparisonView({
  schools,
  selectedCompetition,
  setSelectedCompetition,
  selectedSchool,
  setSelectedSchool,
}: ComparisonViewProps) {
  const [selectedTeams, setSelectedTeams] = useState<{ token: string; competition: string; school: string; teamKey: string }[]>([])
  const options = useMemo(() => {
    type TeamData = { Overall: { School: string; team_key: string } }
    const entries: { value: string; label: string }[] = []
    Object.keys(bajaData as Record<string, Record<string, TeamData>>).forEach((competition) => {
      const teamsForComp = (bajaData as any)[competition] as Record<string, TeamData>
      Object.values(teamsForComp).forEach((team) => {
        const school = team.Overall.School
        const teamKey = team.Overall.team_key
        const value = makeToken(competition, school, teamKey)
        const label = `${school} - ${extractTeamName(teamKey)} - ${competition}`
        entries.push({ value, label })
      })
    })
    return entries.sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const currentValue = useMemo(() => {
    const teamKey = schools.find((s) => s.value === selectedSchool)?.label ?? selectedSchool
    return makeToken(selectedCompetition, selectedSchool, teamKey)
  }, [selectedCompetition, selectedSchool, schools])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Competition & Team Selection</CardTitle>
          <CardDescription>Choose teams by specific competition appearance</CardDescription>
          <CardAction>
             <Combobox
              options={options}
              value={selectedTeams.map(t => t.token)}
              onChange={(tokens) => {
                const newSelectedTeams = tokens.map(token => {
                  const existing = selectedTeams.find(t => t.token === token);
                  if (existing) return existing;

                  const parsed = parseToken(token);
                  if (!parsed) return null;

                  return {
                    token: token!,
                    competition: parsed.competition,
                    school: parsed.school,
                    teamKey: parsed.teamKey,
                  };
                }).filter(Boolean) as { token: string; competition: string; school: string; teamKey: string }[];

                setSelectedTeams(newSelectedTeams);
              }}
              placeholder="Select team and competition"
              searchPlaceholder="Search by team, school, or competition..."
              noResultsText="No matches found."
               className="w-[640px] max-w-full"
               truncateLabel={true}
               maxSelections={6}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          {selectedTeams.length === 0 ? (
            <div className="text-sm text-muted-foreground">No teams added yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTeams.map((item) => (
                <TeamCard
                  key={item.token}
                  teamName={extractTeamName(item.teamKey)}
                  teamSubName={`${item.school} - ${item.competition}`}
                  color={`hsl(${stringToColor(item.token)})`}
                  onRemove={() =>
                    setSelectedTeams((prev) => prev.filter((p) => p.token !== item.token))
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Comparison</CardTitle>
          <CardDescription>Comparing the performance of selected teams across different categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryPerformanceComparison teams={selectedTeams} />
        </CardContent>
      </Card>
    </div>
  )
}

function makeToken(competition: string, school: string, teamKey: string) {
  return `${competition}:::${school}:::${teamKey}`
}

function parseToken(token: string | undefined) {
  if (!token) return null
  const parts = token.split(":::")
  if (parts.length < 3) return null
  const [competition, school, teamKey] = parts
  return { competition, school, teamKey }
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
  // team_key is typically "School - Team Name" or "School - Campus - Team Name".
  // We treat the last segment as the team name.
  const parts = teamKey.split(" - ").map((p) => p.trim()).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : teamKey
}
