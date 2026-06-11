// src/models/User.js
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');

class User {
  static async create({ email, password }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const db = await getDb();
    const result = await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
    return { id: result.lastID, email };
  }

  static async findByEmail(email) {
    const db = await getDb();
    return db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    const db = await getDb();
    return db.get('SELECT * FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;
