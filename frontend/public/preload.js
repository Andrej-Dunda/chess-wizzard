const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Invoke Methods
  getTournaments: (args) => ipcRenderer.invoke('get-tournaments', args),
  getPlayers: (args) => ipcRenderer.invoke('get-players', args),
  getTournament: (args) => ipcRenderer.invoke('get-tournament', args),
  getMatches: (args) => ipcRenderer.invoke('get-matches', args),
  getAllMatches: (args) => ipcRenderer.invoke('get-all-matches', args),
  nextTournamentRound: (args) => ipcRenderer.invoke('next-tournament-round', args),
  changeTournamentPhase: (args) => ipcRenderer.invoke('change-tournament-phase', args),
  // Send Methods
  createTournament: (args) => ipcRenderer.send('create-tournament', args),
  deleteTournament: (args) => ipcRenderer.send('delete-tournament', args),
  putTournament: (args) => ipcRenderer.send('put-tournament', args),
  addPlayer: (args) => ipcRenderer.send('add-player', args),
  removePlayer: (args) => ipcRenderer.send('remove-player', args),
  saveMatches: (args) => ipcRenderer.send('save-matches', args),
  saveResult: (args) => ipcRenderer.send('save-result', args),
  previousTournamentRound: (args) => ipcRenderer.send('previous-tournament-round', args),
  // Receive Methods
  // testReceive: (callback) => ipcRenderer.on('test-receive', (event, data) => { callback(data); })
});