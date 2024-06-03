export interface iTournament {
  id: number;
  name: string;
  phase: string;
  currentRound: number;
  roundsCount: number;
}

export interface iTournamentPlayer {
  id: number;
  tournamentId: number;
  name: string;
  startPosition: number;
  score: number;
  bucholz: number;
  sonnenbornBerger: number;
  opponentIdSequence: number[];
  colorSequence: string[];
}

export interface iRawTournamentPlayer {
  id: number;
  tournamentId: number;
  name: string;
  startPosition: number;
  score: number;
  bucholz: number;
  sonnenbornBerger: number;
  opponentIdSequence: string;
  colorSequence: string;
}

export interface iMatch {
  id: number;
  tournamentId: number;
  round: number;
  boardNumber: number;
  whitePlayer: iTournamentPlayer;
  blackPlayer: iTournamentPlayer;
  result: number | null;
}

export interface iRawMatch {
  id: number;
  tournamentId: number;
  round: number;
  boardNumber: number;
  whitePlayer: string;
  blackPlayer: string;
  result: number | null;
}