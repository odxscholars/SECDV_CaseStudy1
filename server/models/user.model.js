const { users } = require('../database');

const findByUsername = (username) => users.find(u => u.username === username);
const findById = (id) => users.find(u => u.id === id);

module.exports = { findByUsername, findById };
