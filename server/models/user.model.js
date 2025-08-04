const { users } = require('../database');

const findByUsername = (username) => users.find(u => u.username === username);
const findById = (id) => users.find(u => u.id === id);

const createUserRecord = ({ username, password, role }) => {
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const user = { id, username, password, role };
    users.push(user);
    return user;
};

module.exports = { findByUsername, findById, createUserRecord };
