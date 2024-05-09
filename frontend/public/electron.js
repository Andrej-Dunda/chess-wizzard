const db = require('./database'); // Importing the database from the database file
let isDev;
const { app, BrowserWindow, session, ipcMain } = require('electron'); // electron
const path = require('path');

let mainWindow;

// Initializing the Electron Window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 600, // width of window
    height: 600, // height of window
    webPreferences: {
      // The preload file where we will perform our app communication
      preload: isDev 
        ? path.join(app.getAppPath(), './public/preload.js') // Loading it from the public folder for dev
        : path.join(app.getAppPath(), './build/preload.js'), // Loading it from the build folder for production
      worldSafeExecuteJavaScript: true, // If you're using Electron 12+, this should be enabled by default and does not need to be added here.
      contextIsolation: true, // Isolating context so our app is not exposed to random javascript executions making it safer.
    },
  });

	// Loading a webpage inside the electron window we just created
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000' // Loading localhost if dev mode
      : `file://${path.join(__dirname, '../build/index.html')}` // Loading build file if in production
  );

	// In development mode, if the window has loaded, then load the dev tools.
  if (isDev) {
    mainWindow.webContents.on('did-frame-finish-load', () => {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    });
  }
};

// When the app is ready to load
app.whenReady().then(async () => {
  isDev = (await import('electron-is-dev')).default;
  
  await createWindow(); // Create the mainWindow

  // If you want to add React Dev Tools
  if (isDev) {
    await session.defaultSession
      .loadExtension(
        path.join(__dirname, `../userdata/extensions/react-dev-tools`) // This folder should have the chrome extension for React Dev Tools. Get it online or from your Chrome extensions folder.
      )
      .then((name) => console.log('Dev Tools Loaded'))
      .catch((err) => console.log(err));
  }
});

// Exiting the app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Activating the app
app.on('activate', () => {
  if (mainWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Logging any exceptions
process.on('uncaughtException', (error) => {
  console.log(`Exception: ${error}`);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/src`)
  });
}

// players table name generator based on tournament name without spaces and a random string
const generatePlayersTableName = (tournamentName) => {
  return 'players_' + tournamentName.replace(/\s/g, '_') + '_' + Math.random().toString(36).substring(7);
}

// IPC communication

// Create tournament
ipcMain.on('create-tournament', (event, args) => {
  const playersTableName = generatePlayersTableName(args.name);
  db.run('INSERT INTO tournaments (name, date, players_table_name) VALUES (?, ?, ?)', [args.name, args.date, playersTableName], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Tournament created');
    }
  });
  // Create players table
  db.run(`CREATE TABLE ${playersTableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, rating INTEGER)`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Players table created');
    }
  });
});

// Update tournament
ipcMain.handle('put-tournament', (event, args) => {
  db.run('UPDATE tournaments SET name = ? WHERE id = ?', [args.name, args.id], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Tournament updated');
    }
  });
});

// Delete tournament
ipcMain.on('delete-tournament', (event, args) => {
  db.run('DELETE FROM tournaments WHERE id = ?', [args.id], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Tournament deleted');
    }
  });
  db.run(`DROP TABLE ${args.players_table_name}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Players table deleted');
    }
  });
});

// Get tournaments
ipcMain.handle('get-tournaments', async (event, args) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tournaments', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});