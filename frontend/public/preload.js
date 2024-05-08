const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Invoke Methods
  getTournaments: (args) => ipcRenderer.invoke('get-tournaments', args),
  // Send Methods
  createTournament: (args) => ipcRenderer.send('create-tournament', args),
  // Receive Methods
  // testReceive: (callback) => ipcRenderer.on('test-receive', (event, data) => { callback(data); })
});