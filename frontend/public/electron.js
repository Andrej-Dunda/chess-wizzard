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
    if (JSON.parse(match.blackPlayer).name === 'Volno') {
      const whitePlayer = players.find((player) => player.id === JSON.parse(match.whitePlayer).id);
      whitePlayer.score += 1;

      let whitePlayerOpponentIdSequence = JSON.parse(whitePlayer.opponentIdSequence);
      whitePlayerOpponentIdSequence.push(0);
      whitePlayer.opponentIdSequence = JSON.stringify(whitePlayerOpponentIdSequence);

      let whitePlayerColorSequence = JSON.parse(whitePlayer.colorSequence);
      whitePlayerColorSequence.push('bye');
      whitePlayer.colorSequence = JSON.stringify(whitePlayerColorSequence);
      runQuery(`UPDATE players SET score = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [whitePlayer.score, whitePlayer.opponentIdSequence, whitePlayer.colorSequence, whitePlayer.id]);
      return;
    }

    const whitePlayer = players.find((player) => player.id === JSON.parse(match.whitePlayer).id);
    const blackPlayer = players.find((player) => player.id === JSON.parse(match.blackPlayer).id);

    whitePlayer.score += match.result === 1 ? 1 : match.result === 0.5 ? 0.5 : 0;
    blackPlayer.score += match.result === 0 ? 1 : match.result === 0.5 ? 0.5 : 0;

    whitePlayer.bucholz += blackPlayer.score;
    blackPlayer.bucholz += whitePlayer.score;

    whitePlayer.sonnenbornBerger += match.result === 1 ? blackPlayer.score : match.result === 0.5 ? 0.5 * blackPlayer.score : 0;
    blackPlayer.sonnenbornBerger += match.result === 0 ? whitePlayer.score : match.result === 0.5 ? 0.5 * whitePlayer.score : 0;

    let whitePlayerOpponentIdSequence = JSON.parse(whitePlayer.opponentIdSequence);
    whitePlayerOpponentIdSequence.push(blackPlayer.id);
    whitePlayer.opponentIdSequence = JSON.stringify(whitePlayerOpponentIdSequence);

    let blackPlayerOpponentIdSequence = JSON.parse(blackPlayer.opponentIdSequence);
    blackPlayerOpponentIdSequence.push(whitePlayer.id);
    blackPlayer.opponentIdSequence = JSON.stringify(blackPlayerOpponentIdSequence);

    let whitePlayerColorSequence = JSON.parse(whitePlayer.colorSequence);
    whitePlayerColorSequence.push('white');
    whitePlayer.colorSequence = JSON.stringify(whitePlayerColorSequence);

    let blackPlayerColorSequence = JSON.parse(blackPlayer.colorSequence);
    blackPlayerColorSequence.push('black');
    blackPlayer.colorSequence = JSON.stringify(blackPlayerColorSequence);

    runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [whitePlayer.score, whitePlayer.bucholz, whitePlayer.sonnenbornBerger, whitePlayer.opponentIdSequence, whitePlayer.colorSequence, whitePlayer.id]);
    runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [blackPlayer.score, blackPlayer.bucholz, blackPlayer.sonnenbornBerger, blackPlayer.opponentIdSequence, blackPlayer.colorSequence, blackPlayer.id]);
  });
}

const revertPlayerStats = async (tournamentId, round) => {
  console.log({tournamentId: tournamentId, round: round})
  const matches = await allQuery(`SELECT * FROM matches WHERE round = ? AND tournamentId = ?`, [round, tournamentId]);
  console.log('matches: ', matches)

  matches.forEach((match) => {
    const revertedWhitePlayer = JSON.parse(match.whitePlayer);
    const revertedBlackPlayer = JSON.parse(match.blackPlayer);

    runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [revertedWhitePlayer.score, revertedWhitePlayer.bucholz, revertedWhitePlayer.sonnenbornBerger, JSON.stringify(revertedWhitePlayer.opponentIdSequence), JSON.stringify(revertedWhitePlayer.colorSequence), revertedWhitePlayer.id]);
    revertedBlackPlayer.name !== 'Volno' && runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [revertedBlackPlayer.score, revertedBlackPlayer.bucholz, revertedBlackPlayer.sonnenbornBerger, JSON.stringify(revertedBlackPlayer.opponentIdSequence), JSON.stringify(revertedBlackPlayer.colorSequence), revertedBlackPlayer.id]);
  });
}

// Matchmaking

// Save matches
const saveMatch = async (args) => {
  try {
    if (args.blackPlayer.name === 'Volno') {
      await runQuery(`INSERT INTO matches (tournamentId, whitePlayer, blackPlayer, boardNumber, round, result) VALUES (?, ?, ?, ?, ?, ?)`, [args.whitePlayer.tournamentId, JSON.stringify(args.whitePlayer), JSON.stringify(args.blackPlayer), args.boardNumber, args.currentRound, 1]);
      console.log('Match saved');
      return;
    }
    await runQuery(`INSERT INTO matches (tournamentId, whitePlayer, blackPlayer, boardNumber, round) VALUES (?, ?, ?, ?, ?)`, [args.whitePlayer.tournamentId, JSON.stringify(args.whitePlayer), JSON.stringify(args.blackPlayer), args.boardNumber, args.currentRound]);
    console.log('Match saved');
  } catch (err) {
    console.log(err);
  }
};

const sortPlayers = (players) => {
  return players.sort((a, b) => {
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
}

// Get sorted players
const getSortedPlayers = async (tournamentId) => {
  const tournamentPlayers = await allQuery('SELECT * FROM players WHERE tournamentId = ?', [tournamentId]);

  const parsedPlayers = tournamentPlayers.map((player) => {
    return {
      ...player,
      opponentIdSequence: JSON.parse(player.opponentIdSequence),
      colorSequence: JSON.parse(player.colorSequence)
    };
  });

  const sortedPlayers = sortPlayers(parsedPlayers);

  return sortedPlayers;
}

// Check if two players already played against each other
const playersPlayed = (player, opponent) => {
  return player.opponentIdSequence.includes(opponent.id);
}

// Check if a player played with the same color in the last two rounds and his opponent played with the same color in the last two rounds
const sameColorInLastTwoRounds = (player, opponent) => {
  return player.colorSequence[player.colorSequence.length - 1] === opponent.colorSequence[opponent.colorSequence.length - 1] && player.colorSequence[player.colorSequence.length - 2] === opponent.colorSequence[opponent.colorSequence.length - 2] && player.colorSequence[player.colorSequence.length - 1] === player.colorSequence[player.colorSequence.length - 2];
}

// Divide players into subgroups based on their score
const dividePlayersIntoSubgroups = (tournamentPlayers) => {
  let groups = tournamentPlayers.reduce((groups, player) => {
    if (!groups[player.score]) {
      groups[player.score] = [];
    }
    groups[player.score].push(player);
    return groups;
  }, {});

  // Sort the keys in descending order, convert them to numbers, and map them to their corresponding groups
  let subgroups = Object.keys(groups).sort((a, b) => b - a).map(score => groups[score]);

  // Sort players within each subgroup
  subgroups = subgroups.map(subgroup => sortPlayers(subgroup));

  return subgroups;
}

const generateNextRoundMatches = async (tournamentId, currentRound) => {
  let tournamentPlayers = await getSortedPlayers(tournamentId);
  let matches = [];

  let subgroups = dividePlayersIntoSubgroups(tournamentPlayers);

  for (let i = 0; i < subgroups.length; i++) {
    let subgroup = subgroups[i];

    let half = Math.floor(subgroup.length / 2);
    let firstHalf = subgroup.slice(0, half);
    let secondHalf = subgroup.slice(half);

    // console.log('firstHalf', firstHalf);
    // console.log('secondHalf', secondHalf);

    // Prioritize finding a match for a player who was floated into the subgroup
    let floatedPlayerIndex = firstHalf.findIndex(player => player.floated);
    if (floatedPlayerIndex !== -1) {
      let floatedPlayer = firstHalf.splice(floatedPlayerIndex, 1)[0];
      matches.push([secondHalf[0], floatedPlayer]);
      secondHalf = secondHalf.slice(1);
    }

    // Match players at corresponding indexes
    for (let j = 0; j < firstHalf.length; j++) {
      matches.push([firstHalf[j], secondHalf[j]]);
    }

    // If the subgroup has an odd number of players, move the last player to the next subgroup
    if (subgroup.length % 2 !== 0 && subgroups[i + 1]) {
      let floatedPlayer = subgroup.pop();
      floatedPlayer.floated = true;
      subgroups[i + 1].unshift(floatedPlayer);
    } else if (subgroup.length % 2 !== 0 && !subgroups[i + 1]) {
      let floatedPlayer = subgroup.pop();
      matches.push([floatedPlayer, 'Volno']);
    }
  }

  // console.log(matches.map(match => [{name: match[0].name, score: match[0].score}, {name: match[1].name, score: match[1].score}]));
  // console.log(subgroups.map(subgroup => `Index: ${subgroups.indexOf(subgroup)}, Length: ${subgroup.length}, Score value: ${subgroup[0].score}`));

  matches.forEach(async (match, index) => {
    if (match[1] === 'Volno') {
      await saveMatch({ whitePlayer: match[0], blackPlayer: { name: 'Volno', score: 0 }, boardNumber: index + 1, currentRound: currentRound });
    } else {
      await saveMatch({ whitePlayer: match[0], blackPlayer: match[1], boardNumber: index + 1, currentRound: currentRound  });
    }
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
      await updatePlayerStats(args.tournamentId, currentRound - 1);
      console.log('Player stats updated')
    }
    generateNextRoundMatches(args.tournamentId, currentRound);
    console.log('Matches generated')
  } catch (err) {
    console.error(err);
  }
});

// Previous tournament round
ipcMain.on('previous-tournament-round', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET currentRound = CASE WHEN currentRound > 0 THEN currentRound - 1 ELSE 0 END WHERE id = ?', [args.tournamentId]);
    const { currentRound } = await getQuery('SELECT currentRound FROM tournaments WHERE id = ?', [args.tournamentId]);
    await revertPlayerStats(args.tournamentId, currentRound);
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

// Random integer min max
const randomInt = (min, max) => Math.floor(2 * Math.random() * (max - min + 1) + min) / 2;

// Add player
ipcMain.on('add-player', async (event, args) => {
  try {
    await runQuery(`INSERT INTO players (name, tournamentId, score, bucholz, sonnenbornBerger) VALUES (?, ?, ?, ?, ?)`, [args.name, args.tournamentId, randomInt(0, 1), randomInt(0, 1), randomInt(0, 1)]);
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