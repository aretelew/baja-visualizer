export type ViewKey = "overview" | "teams" | "compare";

export type TeamData = { 
  Overall: { School: string; team_key: string };
  [key: string]: any;
}

export type BajaData = Record<string, Record<string, TeamData>>

export type SelectedTeam = { 
  token: string; 
  competition: string; 
  school: string; 
  teamKey: string; 
  lookupKey: string 
}