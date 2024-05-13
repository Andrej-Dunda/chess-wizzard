export interface iTournament {
  id: number;
  name: string;
  date: string;
  phase: string;
  round: number;
  playersTableName: string;
  matchesTableName: string;
}

export interface iTournamentPlayer {
  id: number;
  name: string;
  startPosition: number;
  score: number;
  bucholz: number;
  sonnenbornBerger: number;
  opponentsIds: string;
  gamesAsWhite: number;
  gamesAsBlack: number;
}

export interface iMatch {
  id: number;
  whitePlayer: iTournamentPlayer;
  blackPlayer: iTournamentPlayer;
  result: number | null;
  boardNumber: number;
  round: number;
}