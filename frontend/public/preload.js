const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Invoke Methods
  getTournaments: (args) => ipcRenderer.invoke('get-tournaments', args),
  getPlayers: (args) => ipcRenderer.invoke('get-players', args),
  getTournament: (args) => ipcRenderer.invoke('get-tournament', args),
  // Send Methods
  createTournament: (args) => ipcRenderer.send('create-tournament', args),
  deleteTournament: (args) => ipcRenderer.send('delete-tournament', args),
  putTournament: (args) => ipcRenderer.send('put-tournament', args),
  addPlayer: (args) => ipcRenderer.send('add-player', args),
  removePlayer: (args) => ipcRenderer.send('remove-player', args),
  changeTournamentPhase: (args) => ipcRenderer.send('change-tournament-phase', args)
  // Receive Methods
  // testReceive: (callback) => ipcRenderer.on('test-receive', (event, data) => { callback(data); })
});