const bcrypt = require('bcrypt');

const users = [
    { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: 2, username: 'manager', password: bcrypt.hashSync('manager123', 10), role: 'manager' },
    { id: 3, username: 'employee', password: bcrypt.hashSync('employee123', 10), role: 'employee' },
];

// In-memory storage for blog posts
const posts = [];

module.exports = { users, posts };
