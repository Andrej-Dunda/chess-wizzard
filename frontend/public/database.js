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

// create table
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS tournaments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, date TEXT)');
  db.run('INSERT INTO tournaments (name, date) VALUES ("Tournament 1", "2021-01-01")');
  db.run('INSERT INTO tournaments (name, date) VALUES ("Tournament 2", "2024-01-01")');
});

module.exports = db;