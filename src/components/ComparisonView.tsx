import { CategoryPerformanceComparison } from "./CategoryPerformanceComparison";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, Plus, SearchX } from "lucide-react"
import bajaData from "../../baja-data.json"
import { useMemo, useState } from "react"
import { TeamCard } from "./TeamCard"
import { Button } from "@/components/ui/button"

type TeamData = { Overall: { School: string; team_key: string } }
type BajaData = Record<string, Record<string, TeamData>>
type SelectedTeam = { token: string; competition: string; school: string; teamKey: string }
type TeamOption = {
  value: string
  label: string
  searchValue: string
  competition: string
  school: string
  teamKey: string
  teamName: string
}

const MAX_SELECTIONS = 6
const MIN_SEARCH_LENGTH = 2
const MAX_RESULTS = 40

interface ComparisonViewProps {
  schools?: { value: string; label: string }[]
  selectedCompetition?: string
  selectedSchool?: string
  suppressInitialAnimation?: boolean
}

export function ComparisonView({ suppressInitialAnimation = false }: ComparisonViewProps) {
  const [selectedTeams, setSelectedTeams] = useState<SelectedTeam[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const options = useMemo<TeamOption[]>(() => {
    const entries: TeamOption[] = []
    Object.keys(bajaData as BajaData).forEach((competition) => {
      const teamsForComp = (bajaData as BajaData)[competition] as Record<string, TeamData>
      Object.values(teamsForComp).forEach((team) => {
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
        },
      ]
    })
  }

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

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-lg font-semibold leading-none">Category Performance Comparison</div>
          <div className="text-sm text-muted-foreground">
            Each event is displayed separately for clearer team-to-team comparisons.
          </div>
        </div>
        <CategoryPerformanceComparison
          teams={selectedTeams}
          suppressInitialAnimation={suppressInitialAnimation}
        />
      </div>
    </div>
  )
}

function makeToken(competition: string, school: string, teamKey: string) {
  return `${competition}:::${school}:::${teamKey}`
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
