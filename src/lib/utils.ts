import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stringToColor(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `${hue} 70% 50%`
}

export function extractTeamName(teamKey: string): string {
  // team_key is typically "School - Team Name" or "School - Campus - Team Name".
  // We treat the last segment as the team name.
  const parts = teamKey.split(" - ").map((p) => p.trim()).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : teamKey
}