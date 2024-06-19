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
    icon: path.join(app.getAppPath(), './assets/icon.png') // Set the path to your icon file here
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

  for (const match of matches) {
    console.log('updating PlayerStats')
    if (JSON.parse(match.blackPlayer).name === 'Volno') {
      const whitePlayer = players.find((player) => player.id === JSON.parse(match.whitePlayer).id);
      whitePlayer.score += 1;

      let whitePlayerOpponentIdSequence = JSON.parse(whitePlayer.opponentIdSequence);
      whitePlayerOpponentIdSequence.push(0);
      whitePlayer.opponentIdSequence = JSON.stringify(whitePlayerOpponentIdSequence);

      let whitePlayerColorSequence = JSON.parse(whitePlayer.colorSequence);
      whitePlayerColorSequence.push('bye');
      whitePlayer.colorSequence = JSON.stringify(whitePlayerColorSequence);
      await runQuery(`UPDATE players SET score = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [whitePlayer.score, whitePlayer.opponentIdSequence, whitePlayer.colorSequence, whitePlayer.id]);
      continue;
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

    await runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [whitePlayer.score, whitePlayer.bucholz, whitePlayer.sonnenbornBerger, whitePlayer.opponentIdSequence, whitePlayer.colorSequence, whitePlayer.id]);
    await runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [blackPlayer.score, blackPlayer.bucholz, blackPlayer.sonnenbornBerger, blackPlayer.opponentIdSequence, blackPlayer.colorSequence, blackPlayer.id]);
    console.log([whitePlayer.score, whitePlayer.bucholz, whitePlayer.sonnenbornBerger, whitePlayer.opponentIdSequence, whitePlayer.colorSequence, whitePlayer.id])
    console.log([blackPlayer.score, blackPlayer.bucholz, blackPlayer.sonnenbornBerger, blackPlayer.opponentIdSequence, blackPlayer.colorSequence, blackPlayer.id])
  }
}


const revertPlayerStats = async (tournamentId, round) => {
  const matches = await allQuery(`SELECT * FROM matches WHERE round = ? AND tournamentId = ?`, [round, tournamentId]);

  matches.forEach((match) => {
    const revertedWhitePlayer = JSON.parse(match.whitePlayer);
    const revertedBlackPlayer = JSON.parse(match.blackPlayer);

    runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [revertedWhitePlayer.score, revertedWhitePlayer.bucholz, revertedWhitePlayer.sonnenbornBerger, JSON.stringify(revertedWhitePlayer.opponentIdSequence), JSON.stringify(revertedWhitePlayer.colorSequence), revertedWhitePlayer.id]);
    revertedBlackPlayer.name !== 'Volno' && runQuery(`UPDATE players SET score = ?, bucholz = ?, sonnenbornBerger = ?, opponentIdSequence = ?, colorSequence = ? WHERE id = ?`, [revertedBlackPlayer.score, revertedBlackPlayer.bucholz, revertedBlackPlayer.sonnenbornBerger, JSON.stringify(revertedBlackPlayer.opponentIdSequence), JSON.stringify(revertedBlackPlayer.colorSequence), revertedBlackPlayer.id]);
  });
}

// Save matches
const saveMatch = async (args) => {
  try {
    if (args.blackPlayer.name === 'Volno') {
      await runQuery(`INSERT INTO matches (tournamentId, whitePlayer, blackPlayer, boardNumber, round, result) VALUES (?, ?, ?, ?, ?, ?)`, [args.whitePlayer.tournamentId, JSON.stringify(args.whitePlayer), JSON.stringify(args.blackPlayer), args.boardNumber, args.currentRound, 1]);
      // console.log([args.whitePlayer.tournamentId, JSON.stringify(args.whitePlayer), JSON.stringify(args.blackPlayer), args.boardNumber, args.currentRound, 1]);
      return;
    }
    await runQuery(`INSERT INTO matches (tournamentId, whitePlayer, blackPlayer, boardNumber, round) VALUES (?, ?, ?, ?, ?)`, [args.whitePlayer.tournamentId, JSON.stringify(args.whitePlayer), JSON.stringify(args.blackPlayer), args.boardNumber, args.currentRound]);
    // console.log([args.whitePlayer.tournamentId, JSON.stringify(args.whitePlayer), JSON.stringify(args.blackPlayer), args.boardNumber, args.currentRound]);
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

// Swiss system matchmaking

const _createMatchMatrix = (playerList, currentRound) => {
  const pointMatrix = [];
  for (let index = 0; index < playerList.length; index++) {
    const pointList = [];
    for (let index2 = 0; index2 < index; index2++) {
      const playerOne = playerList[index];
      const pointOne = playerOne ? playerOne.score : -1;
      const playerTwo = playerList[index2];
      const pointTwo = playerTwo ? playerTwo.score : -1;
      let badnessPoint = 0;
      badnessPoint += playerOne.opponentIdSequence.filter((opponentId) => opponentId === playerTwo.id).length * 1000;
      badnessPoint += (pointOne - pointTwo) ** 2;
      badnessPoint += (index - index2) / 1000;
      badnessPoint -= currentRound === 1 ? Math.abs(playerOne.startPosition - playerTwo.startPosition) : 0;

      // Penalty for not alternating colors or playing the same color more than 3 times in a row
      const colorPenalty = (player, otherPlayer) => {
        const playerColorSequence = player.colorSequence;
        const otherPlayerColorSequence = otherPlayer.colorSequence;
        let penalty = 0;

        // Check if the player has played the same color in the last match
        if (playerColorSequence.length > 0 && playerColorSequence[playerColorSequence.length - 1] === otherPlayerColorSequence[otherPlayerColorSequence.length - 1]) {
          penalty += 1 * currentRound; // Penalize for not alternating colors

          if (playerColorSequence.length > 1 && playerColorSequence[playerColorSequence.length - 2] === otherPlayerColorSequence[otherPlayerColorSequence.length - 2] && playerColorSequence[playerColorSequence.length - 2] === playerColorSequence[playerColorSequence.length - 1]) {
            penalty += 5 * currentRound; // Penalize for playing the same color twice in a row

            if (playerColorSequence.length > 2 && playerColorSequence[playerColorSequence.length - 3] === otherPlayerColorSequence[otherPlayerColorSequence.length - 3] && playerColorSequence[playerColorSequence.length - 3] === playerColorSequence[playerColorSequence.length - 1]) {
              penalty += 10 * currentRound; // Penalize for playing the same color three times in a row
            }
          }
        }

        return penalty;
      };

      // Apply color penalties
      badnessPoint += currentRound > 2 ? colorPenalty(playerOne, playerTwo) : 0;

      pointList.push(badnessPoint);
    }
    pointMatrix.push(pointList);
  }
  return pointMatrix;
};

const _findAllPairings = (playerList, pointMatrix, ignore, _players) => {
  let byePairing = null;

  // Correct variable name from playersList to playerList
  if (playerList.length % 2 !== 0) {
    const playerWithoutFreeRound = [...playerList].reverse().find(player => !player.opponentIdSequence.includes(0));
    if (playerWithoutFreeRound) {
      const playerIndex = playerList.indexOf(playerWithoutFreeRound);
      // Remove the player with a bye from the list
      const freeRoundPlayer = playerList.splice(playerIndex, 1)[0];
      // Create a bye pairing for the free round player with 'Volno' as the imaginary opponent
      byePairing = { "list": [[freeRoundPlayer, {id: 0, name: 'Volno', colorSequence: [], opponentIdSequence: []}]], "points": 0 };
    }
  }

  if (playerList.length <= 2) {
    if (playerList.length !== 2) throw new Error("Even numbered players should be handled elsewhere.");
    const origIndexOne = _players.indexOf(playerList[0]);
    const origIndexTwo = _players.indexOf(playerList[1]);
    const point = pointMatrix[origIndexTwo][origIndexOne];
    let basePairing = [{ "list": [playerList], "points": point }];
    // Add the bye pairing to the end if it exists
    if (byePairing) basePairing.push(byePairing);
    return basePairing;
  }

  let comboList = [];
  for (let index = 1; index < playerList.length; index++) {
    const origIndexOne = _players.indexOf(playerList[0]);
    const origIndexTwo = _players.indexOf(playerList[index]);
    const point = pointMatrix[origIndexTwo][origIndexOne];
    if (point > ignore && index > 1) continue;
    let copyList = [...playerList];
    let firstPair = [];
    firstPair.push(copyList.shift());
    firstPair.push(copyList.splice(index - 1, 1)[0]);
    _findAllPairings(copyList, pointMatrix, ignore, _players).forEach(generatedComboList => {
      let newElement = { "list": [firstPair, ...generatedComboList["list"]], "points": point + generatedComboList["points"] };
      // Add the bye pairing to the end of each combination if it exists
      if (byePairing) newElement.list.push(byePairing.list[0]);
      comboList.push(newElement);
    });
  }
  return comboList;
};

const generateNextRoundMatches = async (tournamentId, currentRound) => {
  try {
    const players = await getSortedPlayers(tournamentId); // Assuming this function fetches and sorts players based on their scores and other criteria
    const pointMatrix = _createMatchMatrix(players, currentRound);
    const ignoreThreshold = 1000; // Threshold to ignore matchups with too high "badness" scores, adjust as needed
    const allPossiblePairings = _findAllPairings(players, pointMatrix, ignoreThreshold, players);

    if (allPossiblePairings.length === 0) {
      throw new Error("No valid pairings found.");
    }

    // Select the pairing with the lowest total "badness" score
    const bestPairing = allPossiblePairings.reduce((best, current) => {
      return current.points < best.points ? current : best;
    });

    await Promise.all(bestPairing.list.map(async (pair, index) => {
      if (pair[1].name === 'Volno') {
        return saveMatch({
          whitePlayer: pair[0],
          blackPlayer: pair[1],
          boardNumber: index + 1,
          currentRound: currentRound
        });
      }

      // Function to find the most recent round with different colors
      const findMostRecentDifferentColorRound = (player1, player2) => {
        const minLength = Math.min(player1.colorSequence.length, player2.colorSequence.length);
        for (let i = 1; i <= minLength; i++) {
          const color1 = player1.colorSequence[player1.colorSequence.length - i];
          const color2 = player2.colorSequence[player2.colorSequence.length - i];
          if (color1 !== color2) return {color1, color2};
        }
        return null;
      };
    
      // Retrieve the most recent round where the players had different colors
      const recentDifferentRound = findMostRecentDifferentColorRound(pair[0], pair[1]);
    
      let whitePlayer, blackPlayer;
      if (recentDifferentRound) {
        // If found, swap colors based on the most recent different round
        whitePlayer = recentDifferentRound.color1 === 'black' ? pair[0] : pair[1];
        blackPlayer = recentDifferentRound.color1 === 'black' ? pair[1] : pair[0];
      } else {
        // If not found or all rounds had the same colors, use the existing logic
        const lastColorPlayer1 = pair[0].colorSequence.length > 0 ? pair[0].colorSequence[pair[0].colorSequence.length - 1] : 'white';
        const lastColorPlayer2 = pair[1].colorSequence.length > 0 ? pair[1].colorSequence[pair[1].colorSequence.length - 1] : 'white';
    
        if (lastColorPlayer1 !== lastColorPlayer2) {
          whitePlayer = lastColorPlayer1 === 'black' ? pair[0] : pair[1];
          blackPlayer = lastColorPlayer1 === 'black' ? pair[1] : pair[0];
        } else {
          whitePlayer = index % 2 === 0 ? pair[0] : pair[1];
          blackPlayer = index % 2 === 0 ? pair[1] : pair[0];
        }
      }
    
      // Save the match with the determined color assignment
      return saveMatch({
        whitePlayer: whitePlayer,
        blackPlayer: blackPlayer,
        boardNumber: index + 1,
        currentRound: currentRound
      });
    }));

  } catch (error) {
    console.error("Error creating Swiss pairings:", error);
  }
};

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
ipcMain.handle('change-tournament-phase', async (event, args) => {
  try {
    await runQuery('UPDATE tournaments SET phase = ? WHERE id = ?', [args.phase, args.tournamentId]);
    const { currentRound } = await getQuery('SELECT currentRound FROM tournaments WHERE id = ?', [args.tournamentId]);
    if (args.phase === 'finished') {
      await updatePlayerStats(args.tournamentId, currentRound);
    } else if (args.phase === 'playtime' && args.currentPhase === 'finished') {
      await revertPlayerStats(args.tournamentId, currentRound)
    }
    console.log('Tournament phase updated');
    const matches = await allQuery('SELECT * FROM matches WHERE tournamentId = ? AND round = ?', [args.tournamentId, currentRound]);
    const tournament = await getQuery('SELECT * FROM tournaments WHERE id = ?', [args.tournamentId]);
    const players = await allQuery('SELECT * FROM players WHERE tournamentId = ?', [args.tournamentId]);

    return { matches, tournament, players };
  } catch (err) {
    console.log(err);
  }
});

// Next tournament round
ipcMain.handle('next-tournament-round', async (event, args) => {
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
    await generateNextRoundMatches(args.tournamentId, currentRound);
    console.log('Matches generated')
    const matches = await allQuery('SELECT * FROM matches WHERE tournamentId = ? AND round = ?', [args.tournamentId, currentRound]);
    const tournament = await getQuery('SELECT * FROM tournaments WHERE id = ?', [args.tournamentId]);
    const players = await allQuery('SELECT * FROM players WHERE tournamentId = ?', [args.tournamentId]);

    return { matches, tournament, players };
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

// Get all matches
ipcMain.handle('get-all-matches', async (event, args) => {
  try {
    let matches = [];
    for (let i = 1; i <= args.currentRound; i++) {
      let roundMatches = await allQuery(`SELECT * FROM matches WHERE tournamentId = ? AND round = ?`, [args.tournamentId, i])
      matches.push(roundMatches.sort((a, b) => a.boardNumber - b.boardNumber));
    }
    return matches;
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