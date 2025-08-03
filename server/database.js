const bcrypt = require('bcrypt');

const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('Admin123!', 10),
    role: 'admin',
    passwordHistory: [bcrypt.hashSync('Admin123!', 10)],
    lastPasswordChange: new Date('2025-08-01T00:00:00Z').toISOString()
  },
  {
    id: 2,
    username: 'manager',
    password: bcrypt.hashSync('Manager123!', 10),
    role: 'manager',
    passwordHistory: [bcrypt.hashSync('Manager123!', 10)],
    lastPasswordChange: new Date('2025-08-01T00:00:00Z').toISOString()
  },
  {
    id: 3,
    username: 'employee',
    password: bcrypt.hashSync('Employee123!', 10),
    role: 'employee',
    passwordHistory: [bcrypt.hashSync('Employee123!', 10)],
    lastPasswordChange: new Date('2025-08-01T00:00:00Z').toISOString()
  }
];


// In-memory storage for blog posts
const posts = [];

module.exports = { users, posts };
