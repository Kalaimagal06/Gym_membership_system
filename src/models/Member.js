// src/models/Member.js
const { getDb } = require('../config/database');

class Member {
  static async create({ name, age, membership_type, start_date }) {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO members (name, age, membership_type, start_date) VALUES (?, ?, ?, ?)',
      [name, age, membership_type, start_date]
    );
    return { id: result.lastID, name, age, membership_type, start_date };
  }

  static async findAll() {
    const db = await getDb();
    return db.all('SELECT * FROM members');
  }

  static async findById(id) {
    const db = await getDb();
    return db.get('SELECT * FROM members WHERE id = ?', [id]);
  }

  static async update(id, { name, age, membership_type, start_date }) {
    const db = await getDb();
    await db.run(
      'UPDATE members SET name = ?, age = ?, membership_type = ?, start_date = ? WHERE id = ?',
      [name, age, membership_type, start_date, id]
    );
    return { id, name, age, membership_type, start_date };
  }

  static async delete(id) {
    const db = await getDb();
    await db.run('DELETE FROM members WHERE id = ?', [id]);
    return { id };
  }
}

module.exports = Member;
