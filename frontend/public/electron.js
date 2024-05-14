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

// Save matches
const saveMatch = async (args) => {
  try {
    await runQuery(`INSERT INTO matches (tournamentId, whitePlayer, blackPlayer, boardNumber, round) VALUES (?, ?, ?, ?, ?)`, [args.whitePlayer.tournamentId, JSON.stringify(args.whitePlayer), JSON.stringify(args.blackPlayer), args.boardNumber, args.currentRound]);
    console.log('Match saved');
  } catch (err) {
    console.log(err);
  }
};

const createMatch = (player1, player2, matchesCount, round) => {
  const newMatch = {
    whitePlayer: player1.gamesAsWhite <= player1.gamesAsBlack ? player1 : player2,
    blackPlayer: player1.gamesAsWhite > player1.gamesAsBlack ? player1 : player2,
    boardNumber: matchesCount + 1,
    round: round
  }
  saveMatch(newMatch);
  return newMatch;
}

const groupPlayers = (players) => {
  let groups = {};
  players.forEach(player => {
    if (!groups[player.score]) {
      groups[player.score] = [];
    }
    groups[player.score].push(player);
  });
  return Object.values(groups);
}

const divideGroup = (group) => {
  let mid = Math.floor(group.length / 2);
  return [group.slice(0, mid), group.slice(mid)];
}

const matchBestPlayers = (subgroup1, remainingPlayers, round) => {
  let matches = [];
  while (subgroup1.length > 0 && remainingPlayers.length > 0) {
    let player1 = subgroup1.shift();
    let player2Index = remainingPlayers.findIndex(player2 => !player1.opponentsIds.includes(player2.id));
    let player2;
    if (player2Index !== -1) {
      player2 = remainingPlayers.splice(player2Index, 1)[0];
    } else {
      player2 = remainingPlayers.shift();
    }
    matches.push(createMatch(player1, player2, matches.length, round));
  }
  if (subgroup1.length > 0) {
    // Give the last player a free round if they haven't had one yet
    let player1 = subgroup1.shift();
    if (!player1.hasHadFreeRound) {
      player1.score += 1; // Give the player a free point
      player1.hasHadFreeRound = true;
      matches.push(createMatch(player1, { id: 'Volno', score: 0 }, matches.length, round));
    } else {
      let player2 = remainingPlayers.shift();
      matches.push(createMatch(player1, player2, matches.length, round));
    }
  }
  return matches;
}

const matchPlayers = async (args) => {
  const tournamentPlayers = await allQuery('SELECT * FROM players WHERE tournamentId = ?', [args.tournamentId]);
  const round = args.currentRound;
  let sortedPlayers = tournamentPlayers.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    } else if (b.sonnenbornBerger !== a.sonnenbornBerger) {
      return b.sonnenbornBerger - a.sonnenbornBerger;
    } else if (b.bucholz !== a.bucholz) {
      return b.bucholz - a.bucholz;
    } else {
      return a.startPosition - b.startPosition;
    }
  });

  let groups = groupPlayers(sortedPlayers);
  let remainingPlayers = [...sortedPlayers];
  let newMatches = [];

  for (let group of groups) {
    let [subgroup1, subgroup2] = divideGroup(group);
    newMatches.push(...matchBestPlayers(subgroup1, remainingPlayers, round));
    newMatches.push(...matchBestPlayers(subgroup2, remainingPlayers, round));
  }
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

const updatePlayerStats = async (tournamentId, round) => {
  const players = await allQuery(`SELECT * FROM players WHERE tournamentId = ?`, [tournamentId]);
  const matches = await allQuery(`SELECT * FROM matches WHERE tournamentId = ? AND round = ?`, [tournamentId, round]);

  matches.forEach((match) => {
    const whitePlayer = players.find((player) => player.id === JSON.parse(match.whitePlayer).id);
    const blackPlayer = players.find((player) => player.id === JSON.parse(match.blackPlayer).id);

    whitePlayer.score += match.result === 1 ? 1 : match.result === 0.5 ? 0.5 : 0;
    blackPlayer.score += match.result === 0 ? 1 : match.result === 0.5 ? 0.5 : 0;

    whitePlayer.bucholz += blackPlayer.score;
    blackPlayer.bucholz += whitePlayer.score;

    whitePlayer.sonnenbornBerger += match.result === 1 ? blackPlayer.score : match.result === 0.5 ? 0.5 * blackPlayer.score : 0;
    blackPlayer.sonnenbornBerger += match.result === 0 ? whitePlayer.score : match.result === 0.5 ? 0.5 * whitePlayer.score : 0;

    whitePlayer.opponentIdSequence = JSON.stringify(JSON.parse(whitePlayer.opponentIdSequence).push(blackPlayer.id));
    blackPlayer.opponentIdSequence = JSON.stringify(JSON.parse(blackPlayer.opponentIdSequence).push(whitePlayer.id));

    whitePlayer.colorSequence = JSON.stringify(JSON.parse(whitePlayer.colorSequence).push('white'));
    blackPlayer.colorSequence = JSON.stringify(JSON.parse(blackPlayer.colorSequence).push('black'));

    runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [whitePlayer.score, whitePlayer.bucholz, whitePlayer.sonnenbornBerger, whitePlayer.opponentIdSequence, whitePlayer.colorSequence, whitePlayer.id]);
    runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [blackPlayer.score, blackPlayer.bucholz, blackPlayer.sonnenbornBerger, blackPlayer.opponentIdSequence, blackPlayer.colorSequence, blackPlayer.id]);
  });
}

const revertPlayerStats = async (tournamentId, round) => {
  const matches = await allQuery(`SELECT * FROM matches WHERE round = ? AND tournamentId = ?`, [round, tournamentId]);

  matches.forEach((match) => {
    const revertedWhitePlayer = JSON.parse(match.whitePlayer);
    const revertedBlackPlayer = JSON.parse(match.blackPlayer);

    runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [revertedWhitePlayer.score, revertedWhitePlayer.bucholz, revertedWhitePlayer.sonnenbornBerger, revertedWhitePlayer.opponentIdSequence, revertedWhitePlayer.colorSequence, revertedWhitePlayer.id]);
    runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [revertedBlackPlayer.score, revertedBlackPlayer.bucholz, revertedBlackPlayer.sonnenbornBerger, revertedBlackPlayer.opponentIdSequence, revertedBlackPlayer.colorSequence, revertedBlackPlayer.id]);
  });
}

// IPC communication

// Create tournament
ipcMain.on('create-tournament', async (event, args) => {
  try {
    await runQuery('INSERT INTO tournaments (name, roundsCount) VALUES (?, ?)', [args.name, args.roundsCount]);
    console.log('Tournament created');
  } catch (err) {
    console.log(err);
  }
});

// Update tournament
ipcMain.on('put-tournament', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET name = ? WHERE id = ?', [args.name, args.tournamentId]);
    console.log('Tournament updated');
  } catch (err) {
    console.log(err);
  }
});

// Delete tournament
ipcMain.on('delete-tournament', async (event, args) => {
  try {
    await runQuery('DELETE FROM tournaments WHERE id = ?', [args.tournamentId]);
    await runQuery('DELETE FROM players WHERE tournamentId = ?', [args.tournamentId]);
    console.log('Tournament deleted');
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
    const row = await getQuery('SELECT * FROM tournaments WHERE id = ?', [args.tournamentId]);
    return row;
  } catch (err) {
    console.error(err);
  }
});

// Change tournament phase
ipcMain.on('change-tournament-phase', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET phase = ? WHERE id = ?', [args.phase, args.tournamentId]);
    console.log('Tournament phase updated');
  } catch (err) {
    console.log(err);
  }
});

// Next tournament round
ipcMain.on('next-tournament-round', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET currentRound = currentRound + 1 WHERE id = ?', [args.tournamentId]);
    const { currentRound } = await getQuery('SELECT currentRound FROM tournaments WHERE id = ?', [args.tournamentId]);

    if (currentRound === 1) {
      let players = await allQuery('SELECT * FROM players WHERE tournamentId = ?', [args.tournamentId]);
      await Promise.all(players.map((player, index) => runQuery('UPDATE players SET startPosition = ? WHERE id = ?', [index + 1, player.id])));
    } else {
      await updatePlayerStats({ tournamentId: args.tournamentId, round: currentRound - 1 });
    }
  } catch (err) {
    console.error(err);
  }
});

// Previous tournament round
ipcMain.on('previous-tournament-round', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET currentRound = CASE WHEN currentRound > 0 THEN currentRound - 1 ELSE 0 END WHERE id = ?', [args.tournamentId]);
    const { currentRound } = await getQuery('SELECT currentRound FROM tournaments WHERE id = ?', [args.tournamentId]);
    await revertPlayerStats({ tournamentId: args.tournamentId, round: currentRound });
    runQuery('DELETE FROM matches WHERE tournamentId = ? AND round > ?', [args.tournamentId, currentRound]);
    console.log('Tournament round updated');
  } catch (err) {
    console.log(err);
  }
});

// Get players
ipcMain.handle('get-players', async (event, args) => {
  try {
    const rows = await allQuery(`SELECT * FROM players WHERE tournamentId = ?`, [args.tournamentId]);
    return rows;
  } catch (err) {
    console.error(err);
  }
});

// Add player
ipcMain.on('add-player', async (event, args) => {
  try {
    await runQuery(`INSERT INTO players (name, tournamentId) VALUES (?, ?)`, [args.name, args.tournamentId]);
    console.log('Player added');
  } catch (err) {
    console.log(err);
  }
});

// Remove player
ipcMain.on('remove-player', async (event, args) => {
  try {
    await runQuery(`DELETE FROM players WHERE id = ?`, [args.playerId]);
    console.log('Player removed');
  } catch (err) {
    console.log(err);
  }
});

// Get matches
ipcMain.handle('get-matches', async (event, args) => {
  try {
    const rows = await allQuery(`SELECT * FROM matches WHERE tournamentId = ? AND round = ?`, [args.tournamentId, args.currentRound]);
    return rows;
  } catch (err) {
    console.error(err);
  }
});

// Save results
ipcMain.on('save-result', async (event, args) => {
  try {
    await runQuery(`UPDATE matches SET result = ? WHERE id = ?`, [args.result, args.matchId]);
    console.log('Result saved');
  } catch (err) {
    console.log(err);
  }
});