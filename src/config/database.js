// src/config/database.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dbDir, 'gym.db');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

let dbPromise = open({
  filename: dbPath,
  driver: sqlite3.Database
}).then(async (db) => {
  await db.exec('PRAGMA journal_mode = WAL;');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    UNIQUE NOT NULL,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    DEFAULT (datetime('now')),
      updated_at    TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS members (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      age             INTEGER NOT NULL,
      membership_type TEXT    NOT NULL DEFAULT 'basic',
      start_date      TEXT    NOT NULL,
      created_at      TEXT    DEFAULT (datetime('now')),
      updated_at      TEXT    DEFAULT (datetime('now'))
    );
  `);
  return db;
});

module.exports = { getDb: () => dbPromise };
