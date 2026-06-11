// src/config/database.js
const fs = require('fs').promises;
const path = require('path');

const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dbDir, 'db.json');

// Initialize database with default structure
async function initDb() {
  try {
    if (!isVercel) {
      await fs.mkdir(dbDir, { recursive: true });
    }
    try {
      await fs.access(dbPath);
    } catch {
      await fs.writeFile(dbPath, JSON.stringify({ users: [], members: [] }, null, 2));
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

initDb();

async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], members: [] };
  }
}

async function writeDb(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { readDb, writeDb };
