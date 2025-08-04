const path = require('path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

// Initialize connection to SQLite database stored in project folder
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables if they do not already exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      passwordHistory TEXT,
      lastPasswordChange TEXT,
      lastLogin TEXT,
      lastFailedLogin TEXT,
      currentLogin TEXT,
      consecutiveFails INTEGER DEFAULT 0,
      recoveryQuestionA TEXT,
      recoveryAnswerA TEXT,
      recoveryQuestionB TEXT,
      recoveryAnswerB TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      author TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`);

  // Seed default users if they do not exist
  const seedUsers = [
    { username: 'admin', password: bcrypt.hashSync('Admin123!', 10), role: 'admin' },
    { username: 'manager', password: bcrypt.hashSync('Manager123!', 10), role: 'manager' },
    { username: 'employee', password: bcrypt.hashSync('Employee123!', 10), role: 'employee' }
  ];

  seedUsers.forEach(u => {
    db.get('SELECT id FROM users WHERE username = ?', [u.username], (err, row) => {
      if (err) return console.error('Seed check error:', err);
      if (!row) {
        const history = JSON.stringify([u.password]);
        db.run(
          `INSERT INTO users (username, password, role, passwordHistory, lastPasswordChange)
           VALUES (?, ?, ?, ?, ?)`,
          [u.username, u.password, u.role, history, new Date('2025-08-01T00:00:00Z').toISOString()],
          err2 => {
            if (err2) console.error('Seed insert error:', err2);
          }
        );
      }
    });
  });
});

module.exports = db;

