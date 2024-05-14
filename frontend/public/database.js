const { app } = require('electron');
const sqlite3 = require('sqlite3');
const path = require('path');

// Check if the application is packaged
const isDev = !app.isPackaged;

// Initializing a new database
const db = new sqlite3.Database(
  isDev
    ? path.join(__dirname, '../db/chess-wizzard.db') // my root folder if in dev mode
    : path.join(process.resourcesPath, 'db/chess-wizzard.db'), // the resources path if in production build
  (err) => {
    if (err) {
      console.log(`Database Error: ${err}`);
    } else {
      console.log('Database Loaded');
    }
  }
);

// db initialization
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phase TEXT DEFAULT 'registration',
      currentRound INTEGER DEFAULT 0,
      roundsCount INTEGER DEFAULT 5
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournamentId INTEGER,
      name TEXT,
      startPosition INTEGER DEFAULT NULL,
      score INTEGER DEFAULT 0,
      bucholz INTEGER DEFAULT 0,
      sonnenbornBerger INTEGER DEFAULT 0,
      opponentIdSequence TEXT DEFAULT '[]',
      colorSequence TEXT DEFAULT '[]'
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournamentId INTEGER,
      round INTEGER,
      boardNumber INTEGER,
      whitePlayer TEXT,
      blackPlayer TEXT,
      result INTEGER DEFAULT NULL
    )
  `)
});

module.exports = db;