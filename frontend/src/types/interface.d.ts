export interface IElectronAPI {
  createTournament: (data: any) => Promise<any>,
  getTournaments: () => Promise<any>,
  deleteTournament: (data: any) => Promise<any>,
  putTournament: (data: any) => Promise<any>
  getPlayers: (data: any) => Promise<any>,
  addPlayer: (data: any) => Promise<any>,
  removePlayer: (data: any) => Promise<any>,
  changeTournamentPhase: (data: any) => Promise<any>
  getTournament: (data: any) => Promise<any>
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}