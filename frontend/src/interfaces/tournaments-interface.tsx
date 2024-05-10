export interface iTournament {
  id: number;
  name: string;
  date: string;
  phase: string;
  round: number;
  playersTableName: string;
}

export interface iTournamentPlayer {
  id: number;
  name: string;
  startPosition: number;
  score: number;
  bucholz: number;
  sonnenbornBerger: number;
}