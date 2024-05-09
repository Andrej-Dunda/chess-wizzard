export interface IElectronAPI {
  createTournament: (data: any) => Promise<any>,
  getTournaments: () => Promise<any>,
  deleteTournament: (data: any) => Promise<any>,
  putTournament: (data: any) => Promise<any>
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}