import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trophy, Clock, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccelerationData {
  Rank: number;
  "Time Run 1": number | string;
  "Time Run 2": number | string;
  "Best Time": number | string;
  "Score": number;
  "Track Length"?: "100ft" | "150ft";
}

interface AccelerationCardProps {
  data: AccelerationData;
  p1Time?: number;
  totalTeams?: number;
  teamRecord100?: number;
  teamRecord150?: number;
}

export function AccelerationCard({ data, p1Time, totalTeams, teamRecord100, teamRecord150 }: AccelerationCardProps) {
  const run1 = parseFloat(String(data["Time Run 1"] || 0));
  const run2 = parseFloat(String(data["Time Run 2"] || 0));
  const bestTime = parseFloat(String(data["Best Time"] || 0));
  const score = data.Score;
  const rank = data.Rank;

  // Calculate stats
  const timeDelta = run1 > 0 && run2 > 0 ? run2 - run1 : 0;
  
  const gapToP1 = p1Time && bestTime > 0 ? bestTime - p1Time : 0;

  const percentile = totalTeams && totalTeams > 0 ? Math.round(((totalTeams - rank) / totalTeams) * 100) : 0;

  const DISTANCE_M = 45.72; // 150ft
  const avgSpeed = bestTime > 0 ? DISTANCE_M / bestTime : 0;
  const avgSpeedMph = avgSpeed * 2.23694;
  const avgSpeedKmh = avgSpeed * 3.6;

  const isTeamRecord = (data["Track Length"] === "100ft" && teamRecord100 === bestTime) ||
                       (data["Track Length"] === "150ft" && teamRecord150 === bestTime);

  return (
    <Card className="w-full overflow-hidden gap-4">
      <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
        <div>
          <CardTitle>Acceleration</CardTitle>
        </div>
        <div className="text-right">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-lg border font-bold transition-colors",
            rank === 1 ? "bg-yellow-500 text-white border-yellow-600" :
            rank === 2 ? "bg-slate-300 text-slate-900 border-slate-400" :
            rank === 3 ? "bg-amber-600 text-white border-amber-700" :
            "bg-transparent border-border text-muted-foreground"
          )}>
            <Trophy className={cn("h-4 w-4", rank > 3 && "opacity-50")} />
            #{rank}
          </div>
          {totalTeams && <p className="text-xs text-muted-foreground mt-1">Top {percentile}%</p>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Score */}
          <div className="bg-muted/30 rounded-2xl px-4 pt-2 border border-border">
            <p className="text-muted-foreground text-sm mb-1">Total Score</p>
            <div className="text-4xl font-mono font-semibold">{score.toFixed(2)}</div>
          </div>

          {/* Best Time */}
          <div className="bg-muted/30 rounded-2xl px-4 pt-2 border border-border">
            <div className="flex justify-between items-start mb-1">
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" /> Best Time
              </p>
            </div>
            <div className="text-4xl font-mono font-semibold">{bestTime > 0 ? bestTime.toFixed(3) + 's' : 'DNF'}</div>
            {gapToP1 > 0 && (
              <p className="text-sm font-mono font-medium text-red-500">
                +{gapToP1.toFixed(3)}s
              </p>
            )}
            <p className={cn("text-xs mt-1", isTeamRecord ? "text-emerald-500" : "invisible")}>
              {isTeamRecord ? `Team Record (${data["Track Length"]})` : "No Record"}
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-3">
        </div>

        {/* Runs List */}
        <div className="space-y-2 mt-4">
          <div className="bg-muted/30 rounded-xl p-3 flex justify-between items-center border border-border">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Run 1</span>
            </div>
            <span className="font-mono font-medium">{run1 > 0 ? run1.toFixed(3) + 's' : 'DNF'}</span>
          </div>

          <div className="bg-muted/30 rounded-xl p-3 flex justify-between items-center border border-border">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Run 2</span>
            </div>
            <div className="text-right">
              <div className="font-mono font-medium">{run2 > 0 ? run2.toFixed(3) + 's' : 'DNF'}</div>
              {run1 > 0 && run2 > 0 && timeDelta !== 0 && (
                <div className={cn(
                  "text-xs font-mono font-semibold",
                  timeDelta < 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {timeDelta > 0 ? '+' : ''}{timeDelta.toFixed(3)}s
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Average Speed */}
        <div className="bg-muted/30 rounded-xl p-3 border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-purple-400">
            <Gauge className="h-5 w-5" />
            <span className="text-sm font-medium">Est. Avg Speed</span>
          </div>
          <div className="text-purple-400 font-mono">
            <span className="text-lg font-semibold">{avgSpeedMph.toFixed(1)}</span> mph <span className="text-xs opacity-70">({avgSpeedKmh.toFixed(1)} km/h)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

