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

export interface iMatch {
  whitePlayer: iTournamentPlayer;
  blackPlayer: iTournamentPlayer;
  result: number | null;
  boardNumber: number;
  round: number;
}