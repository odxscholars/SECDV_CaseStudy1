const bcrypt = require('bcrypt');

const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('Admin123!', 10),
    role: 'admin',
    passwordHistory: [bcrypt.hashSync('Admin123!', 10)],
    lastPasswordChange: new Date('2025-08-01T00:00:00Z').toISOString(),
    lastLogin: null,
    lastFailedLogin: null,
    currentLogin: null,
    consecutiveFails: 0,
    recoveryQuestionA: 'nickname',
    recoveryAnswerA: 'AdminAnswer1',
    recoveryQuestionB: 'phrase',
    recoveryAnswerB: 'AdminAnswer2'
  },
  {
    id: 2,
    username: 'manager',
    password: bcrypt.hashSync('Manager123!', 10),
    role: 'manager',
    passwordHistory: [bcrypt.hashSync('Manager123!', 10)],
    lastPasswordChange: new Date('2025-08-01T00:00:00Z').toISOString(),
    lastLogin: null,
    lastFailedLogin: null,
    currentLogin: null,
    consecutiveFails: 0,
    recoveryQuestionA: 'nickname',
    recoveryAnswerA: 'ManagerAnswer1',
    recoveryQuestionB: 'phrase',
    recoveryAnswerB: 'ManagerAnswer2'
  },
  {
    id: 3,
    username: 'employee',
    password: bcrypt.hashSync('Employee123!', 10),
    role: 'employee',
    passwordHistory: [bcrypt.hashSync('Employee123!', 10)],
    lastPasswordChange: new Date('2025-08-01T00:00:00Z').toISOString(),
    lastLogin: null,
    lastFailedLogin: null,
    currentLogin: null,
    consecutiveFails: 0,
    recoveryQuestionA: 'nickname',
    recoveryAnswerA: 'EmployeeAnswer1',
    recoveryQuestionB: 'phrase',
    recoveryAnswerB: 'EmployeeAnswer2'
  }
];


// In-memory storage for blog posts
const posts = [];

module.exports = { users, posts };
