import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, Plus, SearchX, BarChart3 } from "lucide-react"
import bajaData from "../../baja-data.json"
import { useMemo, useState } from "react"
import { TeamCard } from "./TeamCard"
import { Button } from "@/components/ui/button"
import { CategoryBarChart } from "./CategoryBarChart"
import type { TeamData, BajaData, SelectedTeam } from "@/types/views"
import { stringToColor, extractTeamName } from "@/lib/utils"
import type { ChartConfig } from "@/components/ui/chart"

type TeamOption = {
  value: string
  label: string
  searchValue: string
  competition: string
  school: string
  teamKey: string
  teamName: string
  lookupKey: string
}

const MAX_SELECTIONS = 6
const MIN_SEARCH_LENGTH = 2
const MAX_RESULTS = 40

// --- Helpers for Data Normalization (adapted from CategoryPerformanceComparison) ---

const CATEGORY_ALIASES: Record<string, { overallKeys: string[]; sectionKeys: string[]; scoreKeys: string[] }> = {
  "Acceleration": {
    overallKeys: ["Acceleration (75)"],
    sectionKeys: ["Acceleration", "Accel"],
    scoreKeys: ["Acceleration Score (75)", "Score", "score"],
  },
  "Suspension": {
    overallKeys: ["Suspension & Traction (75)"],
    sectionKeys: ["Suspension & Traction", "S&T"],
    scoreKeys: ["Suspension & Traction Score (75)", "Score", "score"],
  },
  "Maneuverability": {
    overallKeys: ["Maneuverability (75)", "Land Manuverability (75)"],
    sectionKeys: ["Maneuverability", "Manv"],
    scoreKeys: ["Maneuverability Score (75)", "Land Manuverability Score (75)", "Score", "score"],
  },
  "Hill Climb": {
    overallKeys: ["Hill Climb (75)"],
    sectionKeys: ["Hill Climb", "Hill"],
    scoreKeys: ["Hill Climb Score (75)", "Score", "score"],
  },
  "Rock Crawl": {
    overallKeys: ["Rock Crawl (75)"],
    sectionKeys: ["Rock Crawl"],
    scoreKeys: ["Rock Crawl Score (75)", "Score", "score"],
  },
  "Endurance": {
    overallKeys: ["Endurance (400)", "Endurance Race (400)"],
    sectionKeys: ["Endurance"],
    scoreKeys: ["Endurance Race Score (400)", "Points (400)", "Points", "Score", "score"],
  },
};

const CATEGORIES = ["Acceleration", "Suspension", "Maneuverability", "Hill Climb", "Rock Crawl", "Endurance"];

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return null;
}

function readOverallPoints(teamData: TeamData, category: string): number | null {
  const overall = teamData?.Overall;
  if (!overall) return null;
  const aliases = CATEGORY_ALIASES[category]?.overallKeys ?? [];
  for (const key of aliases) {
    const val = coerceNumber(overall[key as keyof typeof overall]);
    if (val != null) return val;
  }
  return null;
}

function readSectionPoints(teamData: TeamData, category: string): number | null {
  const aliasCfg = CATEGORY_ALIASES[category];
  if (!aliasCfg) return null;
  for (const sectionKey of aliasCfg.sectionKeys) {
    const section = teamData?.[sectionKey];
    if (!section) continue;
    for (const scoreKey of aliasCfg.scoreKeys) {
      const val = coerceNumber(section[scoreKey]);
      if (val != null) return val;
    }
    // Generic fallback: find first numeric key that includes "Score"
    const candidate = Object.entries(section).find(([k, v]) => /score/i.test(k) && typeof v === "number");
    if (candidate && typeof candidate[1] === "number") return candidate[1] as number;
  }
  return null;
}

function getPoints(teamData: TeamData, category: string): number {
  if (!teamData) return 0;
  // Prefer explicit event sections, then fall back to Overall aggregates
  const sectionPoints = readSectionPoints(teamData, category);
  return sectionPoints ?? readOverallPoints(teamData, category) ?? 0;
}

// --------------------------------------------------------------------------

export function ComparisonView() {
  const [selectedTeams, setSelectedTeams] = useState<SelectedTeam[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      score: {
        label: "Score",
        color: "#2563eb",
      },
    }
    selectedTeams.forEach((team) => {
      config[team.token] = {
        label: `${extractTeamName(team.teamKey)} (${team.competition})`,
        color: `hsl(${stringToColor(team.token)})`,
      }
    })
    return config
  }, [selectedTeams])

  const options = useMemo<TeamOption[]>(() => {
    const entries: TeamOption[] = []
    Object.keys(bajaData as BajaData).forEach((competition) => {
      const teamsForComp = (bajaData as BajaData)[competition] as Record<string, TeamData>
      Object.entries(teamsForComp).forEach(([lookupKey, team]) => {
        const school = team.Overall.School
        const teamKey = team.Overall.team_key
        const teamName = extractTeamName(teamKey)
        const value = makeToken(competition, school, teamKey)
        const label = `${school} - ${teamName} - ${competition}`
        entries.push({
          value,
          label,
          competition,
          school,
          teamKey,
          teamName,
          lookupKey,
          searchValue: `${school} ${teamName} ${competition}`.toLowerCase(),
        })
      })
    })
    return entries.sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const optionLookup = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options]
  )

  const readyToSearch = searchQuery.trim().length >= MIN_SEARCH_LENGTH

  const { results: filteredOptions, totalMatches } = useMemo(() => {
    if (!readyToSearch) return { results: [] as TeamOption[], totalMatches: 0 }

    const query = searchQuery.trim().toLowerCase()
    const matches = options.filter((option) => option.searchValue.includes(query))

    return {
      results: matches.slice(0, MAX_RESULTS),
      totalMatches: matches.length,
    }
  }, [options, readyToSearch, searchQuery])

  const limitReached = selectedTeams.length >= MAX_SELECTIONS

  const handleAddTeam = (token: string) => {
    const option = optionLookup.get(token)
    if (!option) return

    setSelectedTeams((prev) => {
      if (prev.some((team) => team.token === token) || prev.length >= MAX_SELECTIONS) {
        return prev
      }

      return [
        ...prev,
        {
          token,
          competition: option.competition,
          school: option.school,
          teamKey: option.teamKey,
          lookupKey: option.lookupKey,
        },
      ]
    })
  }

  const graphs = useMemo(() => {
    return CATEGORIES.map((category) => {
      const data = selectedTeams.map((team) => {
        const teamData = (bajaData as BajaData)[team.competition]?.[team.lookupKey];
        const score = teamData ? getPoints(teamData, category) : 0;
        return {
          token: team.token,
          school: team.school,
          score: score,
          label: `${extractTeamName(team.teamKey)} (${team.competition})`,
          fill: `hsl(${stringToColor(team.token)})`,
        }
      });
      return { category, data };
    });
  }, [selectedTeams])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-[520px] rounded-xl border bg-card text-card-foreground shadow-sm">
          <Command shouldFilter={false} className="h-full rounded-xl">
            <div className="space-y-1 px-4 pb-3 pt-4">
              <div className="text-sm font-semibold leading-none">Competition & Team Search</div>
            </div>
            <div className="border-t" />
            <CommandInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search by school, team, or competition..."
            />
            <CommandList className="max-h-none flex-1 overflow-auto">
              <CommandEmpty>
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
                  <SearchX className="h-6 w-6" />
                  <span className="text-xs">No matches for that search</span>
                </div>
              </CommandEmpty>

              {readyToSearch && filteredOptions.length > 0 && (
                <CommandGroup
                  heading={`Showing ${filteredOptions.length} of ${totalMatches} matches`}
                >
                  {filteredOptions.map((option) => {
                    const isSelected = selectedTeams.some((team) => team.token === option.value)
                    const disabled = (!isSelected && limitReached) || isSelected

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        disabled={disabled}
                        onSelect={() => {
                          if (isSelected || limitReached) return
                          handleAddTeam(option.value)
                        }}
                        className="flex cursor-pointer items-center justify-between gap-3 py-2"
                      >
                        <div className="space-y-1 text-left">
                          <div className="font-medium leading-none">{option.teamName}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.school} · {option.competition}
                          </div>
                        </div>
                        <span
                          className={`rounded-full border p-1 text-xs ${
                            isSelected
                              ? "bg-muted text-foreground"
                              : limitReached
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
              <span>
                Search covers every recorded competition entry. Results are capped at {MAX_RESULTS} per query.
              </span>
              <span>{MAX_SELECTIONS}-team max</span>
            </div>
          </Command>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selected Teams</CardTitle>
            <CardDescription>Teams added for comparison.</CardDescription>
            <CardAction className="flex flex-wrap items-center justify-end gap-3 text-sm text-muted-foreground">
              <span>{selectedTeams.length}/{MAX_SELECTIONS} selected</span>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setSelectedTeams([])}
                disabled={selectedTeams.length === 0}
              >
                Clear all
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {selectedTeams.map((item: SelectedTeam) => (
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
          </CardContent>
        </Card>
      </div>

      <div className="space-y-1 pt-4">
        <div className="text-xl font-semibold leading-none">Category Performance Comparison</div>
        <div className="text-sm text-muted-foreground">
          Individual event results for side-by-side team analytics.
        </div>
      </div>

      {selectedTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No Teams Selected</h3>
          <p className="mt-2 text-muted-foreground max-w-md">
            Select teams from the panel above to compare their performance across different categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {graphs.map(({ category, data }) => (
            <Card key={category}>
              <CardHeader>
                  <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                  <CategoryBarChart
                    data={data}
                    config={chartConfig}
                  />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  )
}

function makeToken(competition: string, school: string, teamKey: string) {
  return `${competition}:::${school}:::${teamKey}`
}