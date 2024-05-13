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

// Save matches
const saveMatch = async (args) => {
  try {
    await runQuery(`INSERT INTO ${args.matchesTableName} (whitePlayer, blackPlayer, boardNumber, round) VALUES (?, ?, ?, ?)`, [JSON.stringify(args.whitePlayer), JSON.stringify(args.blackPlayer), args.boardNumber, args.round]);

    const whitePlayerRow = await getQuery(`SELECT * FROM ${args.playersTableName} WHERE id = ?`, [args.whitePlayer.id]);
    const whitePlayerOpponentsIds = JSON.parse(whitePlayerRow.opponentsIds);
    whitePlayerOpponentsIds.push(args.blackPlayer.id);
    await runQuery(`UPDATE ${args.playersTableName} SET opponentsIds = ?, gamesAsWhite = gamesAsWhite + 1 WHERE id = ?`, [JSON.stringify(whitePlayerOpponentsIds), args.whitePlayer.id]);

    const blackPlayerRow = await getQuery(`SELECT * FROM ${args.playersTableName} WHERE id = ?`, [args.blackPlayer.id]);
    const blackPlayerOpponentsIds = JSON.parse(blackPlayerRow.opponentsIds);
    blackPlayerOpponentsIds.push(args.whitePlayer.id);
    await runQuery(`UPDATE ${args.playersTableName} SET opponentsIds = ?, gamesAsBlack = gamesAsBlack + 1 WHERE id = ?`, [JSON.stringify(blackPlayerOpponentsIds), args.blackPlayer.id]);

    console.log('Match saved');
  } catch (err) {
    console.log(err);
  }
};

const findOpponentIndex = (players, player1, i) => players.findIndex((player2, j) => {
  return j !== i &&
    Math.abs(player1.score - player2.score) <= 1 &&
    !JSON.parse(player1.opponentsIds).includes(player2.id);
});

const removePlayers = (players, i, j) => players.filter((_, index) => index !== i && index !== j);

const createMatch = (player1, player2, matchesCount, round) => ({
  whitePlayer: player1.gamesAsWhite <= player1.gamesAsBlack ? player1 : player2,
  blackPlayer: player1.gamesAsWhite > player1.gamesAsBlack ? player1 : player2,
  result: null,
  boardNumber: matchesCount + 1,
  round: round
});

const matchPlayers = (args) => {
  let sortedPlayers = [...args.tournamentPlayers];
  let newMatches = [];

  while (sortedPlayers.length > 1) {
    for (let i = 0; i < sortedPlayers.length; i++) {
      let player1 = sortedPlayers[i];
      let player2Index = findOpponentIndex(sortedPlayers, player1, i);

      if (player2Index !== -1) {
        let player2 = sortedPlayers[player2Index];
        sortedPlayers = removePlayers(sortedPlayers, i, player2Index);
        newMatches.push(createMatch(player1, player2, newMatches.length, args.round));
        break;
      }
    }
  }

  newMatches.map((match) =>
    saveMatch({
      whitePlayer: match.whitePlayer,
      blackPlayer: match.blackPlayer,
      boardNumber: match.boardNumber,
      round: match.round,
      matchesTableName: args.matchesTableName,
      playersTableName: args.playersTableName
    })
  )
}

const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

const getQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

const allQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// IPC communication

// Create tournament
ipcMain.on('create-tournament', async (event, args) => {
  try {
    const playersTableName = generatePlayersTableName(args.name);
    const matchesTableName = generateMatchesTableName(args.name);

    await runQuery('INSERT INTO tournaments (name, date, phase, round, playersTableName, matchesTableName) VALUES (?, ?, ?, ?, ?, ?)', [args.name, args.date, 'registration', 0, playersTableName, matchesTableName]);
    console.log('Tournament created');

    await runQuery(`CREATE TABLE ${playersTableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, startPosition INTEGER, score REAL, bucholz REAL, sonnenbornBerger REAL, gamesAsWhite INTEGER, gamesAsBlack INTEGER, opponentsIds TEXT)`);
    console.log('Players table created');

    await runQuery(`CREATE TABLE ${matchesTableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, whitePlayer TEXT, blackPlayer TEXT, result TEXT, boardNumber INTEGER, round INTEGER)`);
    console.log('Games table created');
  } catch (err) {
    console.log(err);
  }
});

// Update tournament
ipcMain.on('put-tournament', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET name = ? WHERE id = ?', [args.name, args.id]);
    console.log('Tournament updated');
  } catch (err) {
    console.log(err);
  }
});

// Delete tournament
ipcMain.on('delete-tournament', async (event, args) => {
  try {
    await runQuery('DELETE FROM tournaments WHERE id = ?', [args.id]);
    console.log('Tournament deleted');

    await runQuery(`DROP TABLE ${args.playersTableName}`);
    console.log('Players table deleted');

    await runQuery(`DROP TABLE ${args.matchesTableName}`);
    console.log('Matches table deleted');
  } catch (err) {
    console.log(err);
  }
});

// Get tournaments
ipcMain.handle('get-tournaments', async (event, args) => {
  try {
    const rows = await allQuery('SELECT * FROM tournaments', []);
    return rows;
  } catch (err) {
    console.error(err);
  }
});

// Get tournament
ipcMain.handle('get-tournament', async (event, args) => {
  try {
    const row = await getQuery('SELECT * FROM tournaments WHERE id = ?', [args.id]);
    return row;
  } catch (err) {
    console.error(err);
  }
});

// Change tournament phase
ipcMain.on('change-tournament-phase', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET phase = ? WHERE id = ?', [args.phase, args.id]);
    console.log('Tournament phase updated');
  } catch (err) {
    console.log(err);
  }
});

// Next tournament round
ipcMain.on('next-tournament-round', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET round = round + 1 WHERE id = ?', [args.id]);
    const { round } = await getQuery('SELECT round FROM tournaments WHERE id = ?', [args.id]);
    const { playersTableName, matchesTableName } = await getQuery('SELECT playersTableName, matchesTableName FROM tournaments WHERE id = ?', [args.id]);
    let players = await allQuery('SELECT * FROM ' + playersTableName, []);

    if (round === 1) {
      await Promise.all(players.map((player, index) => runQuery('UPDATE ' + playersTableName + ' SET startPosition = ? WHERE id = ?', [index + 1, player.id])));
      players = await allQuery('SELECT * FROM ' + playersTableName, []);
    }

    matchPlayers({ tournamentPlayers: players, round: round, matchesTableName: matchesTableName, playersTableName: playersTableName });
  } catch (err) {
    console.error(err);
  }
});

// Previous tournament round
ipcMain.on('previous-tournament-round', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET round = round - 1 WHERE id = ?', [args.id]);
    const { matchesTableName, round } = await getQuery('SELECT matchesTableName, round FROM tournaments WHERE id = ?', [args.id]);
    await runQuery('DELETE FROM ' + matchesTableName + ' WHERE round > ?', [round]);
    console.log('Tournament round updated');
  } catch (err) {
    console.log(err);
  }
});

// Get players
ipcMain.handle('get-players', async (event, args) => {
  try {
    const rows = await allQuery(`SELECT * FROM ${args.playersTableName}`, []);
    return rows;
  } catch (err) {
    console.error(err);
  }
});

// Add player
ipcMain.on('add-player', async (event, args) => {
  try {
    await runQuery(`INSERT INTO ${args.playersTableName} (name, score, bucholz, sonnenbornBerger, gamesAsWhite, gamesAsBlack, opponentsIds) VALUES (?, ?, ?, ?, ?, ?, ?)`, [args.name, 0, 0, 0, 0, 0, JSON.stringify([])]);
    console.log('Player added');
  } catch (err) {
    console.log(err);
  }
});

// Remove player
ipcMain.on('remove-player', async (event, args) => {
  try {
    await runQuery(`DELETE FROM ${args.playersTableName} WHERE id = ?`, [args.id]);
    console.log('Player removed');
  } catch (err) {
    console.log(err);
  }
});

// Get matches
ipcMain.handle('get-matches', async (event, args) => {
  try {
    const rows = await allQuery(`SELECT * FROM ${args.matchesTableName} WHERE round = ?`, [args.round]);
    return rows;
  } catch (err) {
    console.error(err);
  }
});

// Save results
ipcMain.on('save-result', async (event, args) => {
  try {
    await runQuery(`UPDATE ${args.matchesTableName} SET result = ? WHERE id = ?`, [args.result, args.id]);
    console.log(args.result, args.matchesTableName, args.id);
    console.log('Result saved');
  } catch (err) {
    console.log(err);
  }
});