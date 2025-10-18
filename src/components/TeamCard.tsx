import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface TeamCardProps {
  teamName: string;
  teamSubName?: string;
  color: string;
  onRemove: () => void;
}

export function TeamCard({ teamName, teamSubName, color, onRemove }: TeamCardProps) {
  const [schoolLine, competitionLine] = (() => {
    if (!teamSubName) return ["", ""] as const
    const parts = teamSubName.split(" - ")
    if (parts.length < 2) return [teamSubName, ""] as const
    const competition = parts[parts.length - 1]
    const school = parts.slice(0, parts.length - 1).join(" - ")
    return [school, competition] as const
  })()

  return (
    <Card className="p-4 flex items-start bg-muted/40 relative">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start min-w-0 pr-6">
        <span
          className="h-3 w-3 rounded-full mr-3 mt-1"
          style={{ backgroundColor: color }}
        ></span>
        <div className="text-left min-w-0">
          <div className="font-semibold leading-tight break-words">
            {teamName}
          </div>
          {schoolLine && (
            <div className="text-sm text-muted-foreground">{schoolLine}</div>
          )}
          {competitionLine && (
            <div className="text-sm text-muted-foreground">
              {competitionLine}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
