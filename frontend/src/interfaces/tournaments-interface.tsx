export interface iTournament {
  id: number;
  name: string;
  date: string;
  phase: string;
  players_table_name: string;
}

export interface iTournamentPlayer {
  id: number;
  name: string;
}