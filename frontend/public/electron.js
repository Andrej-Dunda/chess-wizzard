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
  // if (isDev) {
    mainWindow.webContents.on('did-frame-finish-load', () => {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    });
  // }
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

// games table name generator based on tournament name without spaces and a random string
const generateMatchesTableName = (tournamentName) => {
  return 'matches_' + tournamentName.replace(/\s/g, '_') + '_' + Math.random().toString(36).substring(7);
}

// IPC communication

// Create tournament
ipcMain.on('create-tournament', (event, args) => {
  const playersTableName = generatePlayersTableName(args.name);
  const matchesTableName = generateMatchesTableName(args.name);
  db.run('INSERT INTO tournaments (name, date, phase, round, playersTableName, matchesTableName) VALUES (?, ?, ?, ?, ?, ?)', [args.name, args.date, 'registration', 0, playersTableName, matchesTableName], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Tournament created');
    }
  });
  // Create players table
  db.run(`CREATE TABLE ${playersTableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, startPosition INTEGER, score REAL, bucholz REAL, sonnenbornBerger REAL)`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Players table created');
    }
  });
  // Create matches table
  db.run(`CREATE TABLE ${matchesTableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, whitePlayer TEXT, blackPlayer TEXT, result TEXT, boardNumber INTEGER, round INTEGER)`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Games table created');
    }
  });
});

// Update tournament
ipcMain.on('put-tournament', (event, args) => {
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
  db.run(`DROP TABLE ${args.playersTableName}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Players table deleted');
    }
  });
  // delete matches table
  db.run(`DROP TABLE ${args.matchesTableName}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Matches table deleted');
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

// Get tournament
ipcMain.handle('get-tournament', async (event, args) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM tournaments WHERE id = ?', [args.id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
});

// Change tournament phase
ipcMain.on('change-tournament-phase', (event, args) => {
  db.run('UPDATE tournaments SET phase = ? WHERE id = ?', [args.phase, args.id], (err) => {
    if (err) {
      console.log(err);
    }
  });
})

// Change tournament round
ipcMain.on('change-tournament-round', (event, args) => {
  db.run('UPDATE tournaments SET round = ? WHERE id = ?', [args.round, args.id], (err) => {
    if (err) {
      console.log(err);
    }
  });

  if (args.round === 1) {
    db.get('SELECT playersTableName FROM tournaments WHERE id = ?', [args.id], (err, row) => {
      if (err) {
        console.log(err);
      } else {
        const playersTableName = row.playersTableName;
        db.all('SELECT * FROM ' + playersTableName, [], (err, players) => {
          if (err) {
            console.log(err);
          } else {
            players.map((player, index) => {
              return db.run('UPDATE ' + playersTableName + ' SET startPosition = ? WHERE id = ?', [index + 1, player.id], (err) => {
                if (err) {
                  console.log(err);
                }
              })
            })
          }
        })
      }
    })
  }
  // delete all matches from rounds > args.round
  db.get('SELECT matchesTableName FROM tournaments WHERE id = ?', [args.id], (err, row) => {
    if (err) {
      console.log(err);
    } else {
      const matchesTableName = row.matchesTableName;
      db.run('DELETE FROM ' + matchesTableName + ' WHERE round > ?', [args.round], (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
})

// Get players
ipcMain.handle('get-players', async (event, args) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${args.playersTableName}`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

// random integer generator
const randInt = (max) => {
  return Math.floor(Math.random() * max) / 2;
}

// Add player
ipcMain.on('add-player', (event, args) => {
  db.run(`INSERT INTO ${args.playersTableName} (name, score, bucholz, sonnenbornBerger) VALUES (?, ?, ?, ?)`, [args.name, randInt(10), randInt(40), randInt(30)], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Player added');
    }
  });
});

// Remove player
ipcMain.on('remove-player', (event, args) => {
  db.run(`DELETE FROM ${args.playersTableName} WHERE id = ?`, [args.id], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Player removed');
    }
  });
});

// Save matchmaking
ipcMain.on('save-matches', (event, args) => {
  db.run(`INSERT INTO ${args.matchesTableName} (whitePlayer, blackPlayer, boardNumber, round) VALUES (?, ?, ?, ?)`, [args.whitePlayer, args.blackPlayer, args.boardNumber, args.round], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Match saved');
    }
  });
});

// Get matches
ipcMain.handle('get-matches', async (event, args) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${args.matchesTableName} WHERE round = ?`, [args.round], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

// Save results
ipcMain.on('save-results', (event, args) => {
  db.run(`UPDATE ${args.matchesTableName} SET result = ? WHERE id = ?`, [args.result, args.id], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Result saved');
    }
  });
});