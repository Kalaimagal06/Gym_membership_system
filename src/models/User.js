// src/models/User.js
const bcrypt = require('bcryptjs');
const { readDb, writeDb } = require('../config/database');

class User {
  static async create({ email, password }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const db = await readDb();
    const id = db.users.length > 0 ? db.users[db.users.length - 1].id + 1 : 1;
    const newUser = { id, email, password_hash: passwordHash, created_at: new Date().toISOString() };
    db.users.push(newUser);
    await writeDb(db);
    return { id, email };
  }

  static async findByEmail(email) {
    const db = await readDb();
    return db.users.find(u => u.email === email);
  }

  static async findById(id) {
    const db = await readDb();
    return db.users.find(u => u.id === id);
  }
}

module.exports = User;
