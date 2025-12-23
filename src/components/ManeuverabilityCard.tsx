import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trophy, Clock, Flag } from "lucide-react"
import { cn } from "@/lib/utils"

interface ManeuverabilityData {
  Rank: number | string;
  "Time Run 1": number | string;
  "# Minor Penalty Run 1": number | string;
  "# Major Penalty Run 1"?: number | string;
  "Total Time Run 1": number | string;
  "Time Run 2": number | string;
  "# Minor Penalty Run 2": number | string;
  "# Major Penalty Run 2"?: number | string;
  "Total Time Run 2": number | string;
  "Best Time": number | string;
  "Score": number;
}

interface ManeuverabilityCardProps {
  data: ManeuverabilityData;
  p1Time?: number;
  totalTeams?: number;
}

export function ManeuverabilityCard({ data, p1Time, totalTeams }: ManeuverabilityCardProps) {
  const parseTime = (val: number | string) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && !isNaN(parseFloat(val))) return parseFloat(val);
    return 0;
  };

  const run1Total = parseTime(data["Total Time Run 1"]);
  const run1Raw = parseTime(data["Time Run 1"]);
  const run1Minor = parseInt(String(data["# Minor Penalty Run 1"] || 0));
  const run1Major = parseInt(String(data["# Major Penalty Run 1"] || 0));
  const run1PenaltyTime = run1Total > 0 && run1Raw > 0 ? run1Total - run1Raw : 0;

  const run2Total = parseTime(data["Total Time Run 2"]);
  const run2Raw = parseTime(data["Time Run 2"]);
  const run2Minor = parseInt(String(data["# Minor Penalty Run 2"] || 0));
  const run2Major = parseInt(String(data["# Major Penalty Run 2"] || 0));
  const run2PenaltyTime = run2Total > 0 && run2Raw > 0 ? run2Total - run2Raw : 0;

  const bestTime = parseTime(data["Best Time"]);
  const score = data.Score;
  const rank = typeof data.Rank === 'number' ? data.Rank : 0;

  // Calculate stats
  // For improvement, we compare Total Times. 
  // If a run is DNF (0 or determined by string), we can't calculate improvement properly if one is missing.
  // Using Total Time for improvement comparison.
  const timeDelta = run1Total > 0 && run2Total > 0 ? run2Total - run1Total : 0;
  
  const gapToP1 = p1Time && bestTime > 0 ? bestTime - p1Time : 0;

  const percentile = totalTeams && totalTeams > 0 && rank > 0 ? Math.round(((totalTeams - rank) / totalTeams) * 100) : 0;

  const formatTime = (val: number | string) => {
    if (typeof val === 'number') return val > 0 ? val.toFixed(3) + 's' : 'DNF';
    if (typeof val === 'string') {
      if (val === '' || val === 'DNS') return 'DNS';
      if (val === '--DNF--') return 'DNF';
      return val;
    }
    return 'DNS';
  };

  const renderRunDetails = (runRaw: number, total: number | string, minor: number, major: number, penaltyTime: number, label: string, splitInfo?: { delta: number }) => {
    const hasPenalty = minor > 0 || major > 0;
    const timeDisplay = formatTime(total);
    
    return (
      <div className="bg-muted/30 rounded-xl p-3 border border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          <div className="text-right">
            <div className="font-mono font-medium">{timeDisplay}</div>
            {splitInfo && splitInfo.delta !== 0 && (
              <div className={cn(
                "text-xs font-mono font-semibold",
                splitInfo.delta < 0 ? "text-emerald-500" : "text-red-500"
              )}>
                {splitInfo.delta > 0 ? '+' : ''}{splitInfo.delta.toFixed(3)}s
              </div>
            )}
          </div>
        </div>
        {hasPenalty && (
          <div className="mt-2 text-xs flex justify-end items-center gap-2 text-red-500 font-medium">
             <span>Raw: {runRaw > 0 ? runRaw.toFixed(3) + 's' : 'N/A'}</span>
             <span>|</span>
             <span className="flex items-center gap-1">
               <Flag className="h-3 w-3" />
               +{penaltyTime.toFixed(1)}s ({minor > 0 ? `${minor} Minor` : ''}{minor > 0 && major > 0 ? ', ' : ''}{major > 0 ? `${major} Major` : ''})
             </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full overflow-hidden gap-4">
      <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
        <div>
          <CardTitle>Maneuverability</CardTitle>
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
            #{rank > 0 ? rank : '-'}
          </div>
          {totalTeams && (
            <p className={cn("text-xs text-muted-foreground mt-1", rank > 0 ? "" : "invisible")}>
              Top {rank > 0 ? percentile : 0}%
            </p>
          )}
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
            <p className="text-xs mt-1 invisible">
              Placeholder
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-3">
        </div>

        {/* Runs List */}
        <div className="space-y-2 mt-4">
          {renderRunDetails(run1Raw, data["Total Time Run 1"], run1Minor, run1Major, run1PenaltyTime, "Run 1")}
          {renderRunDetails(run2Raw, data["Total Time Run 2"], run2Minor, run2Major, run2PenaltyTime, "Run 2", 
            run1Total > 0 && run2Total > 0 ? { delta: timeDelta } : undefined
          )}
        </div>
      </CardContent>
    </Card>
  )
}
