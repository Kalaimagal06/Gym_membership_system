// src/models/Member.js
const { readDb, writeDb } = require('../config/database');

class Member {
  static async create({ name, age, membership_type, start_date }) {
    const db = await readDb();
    const id = db.members.length > 0 ? db.members[db.members.length - 1].id + 1 : 1;
    const newMember = { id, name, age, membership_type, start_date, created_at: new Date().toISOString() };
    db.members.push(newMember);
    await writeDb(db);
    return newMember;
  }

  static async findAll() {
    const db = await readDb();
    return db.members;
  }

  static async findById(id) {
    const db = await readDb();
    return db.members.find(m => m.id === parseInt(id));
  }

  static async update(id, { name, age, membership_type, start_date }) {
    const db = await readDb();
    const index = db.members.findIndex(m => m.id === parseInt(id));
    if (index === -1) return null;
    db.members[index] = { ...db.members[index], name, age, membership_type, start_date, updated_at: new Date().toISOString() };
    await writeDb(db);
    return db.members[index];
  }

  static async delete(id) {
    const db = await readDb();
    const index = db.members.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
      db.members.splice(index, 1);
      await writeDb(db);
    }
    return { id };
  }
}

module.exports = Member;
