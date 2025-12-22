export type ViewKey = "overall" | "event" | "team" | "compare";

export type TeamData = { 
  Overall: { School: string; team_key: string };
  [key: string]: Record<string, unknown> | { School: string; team_key: string };
}

export type BajaData = Record<string, Record<string, TeamData>>

export type SelectedTeam = { 
  token: string; 
  competition: string; 
  school: string; 
  teamKey: string; 
  lookupKey: string 
}