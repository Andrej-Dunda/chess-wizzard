export interface IElectronAPI {
  createTournament: (data: any) => Promise<any>,
  getTournaments: () => Promise<any>
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}