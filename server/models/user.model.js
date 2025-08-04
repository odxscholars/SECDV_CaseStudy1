const db = require('../database');

const findByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const createUserRecord = ({ username, password, role }) => {
  return new Promise((resolve, reject) => {
    const history = JSON.stringify([password]);
    const lastPasswordChange = new Date().toISOString();
    db.run(
      `INSERT INTO users (username, password, role, passwordHistory, lastPasswordChange)
       VALUES (?, ?, ?, ?, ?)`,
      [username, password, role, history, lastPasswordChange],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, username, password, role });
      }
    );
  });
};

module.exports = { findByUsername, findById, createUserRecord };

