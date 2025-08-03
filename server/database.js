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
    recoveryQuestionA: 'What’s a nickname that only a few close people have ever used for you?',
    recoveryAnswerA: 'Rudolph',
    recoveryQuestionB: 'What’s an unusual phrase or saying that you often use and few others do?',
    recoveryAnswerB: 'Time is time'
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
    recoveryQuestionA: 'What’s a nickname that only a few close people have ever used for you?',
    recoveryAnswerA: 'Rudolph',
    recoveryQuestionB: 'What’s an unusual phrase or saying that you often use and few others do?',
    recoveryAnswerB: 'Time is time'
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
    recoveryQuestionA: 'What’s a nickname that only a few close people have ever used for you?',
    recoveryAnswerA: 'Rudolph',
    recoveryQuestionB: 'What’s an unusual phrase or saying that you often use and few others do?',
    recoveryAnswerB: 'Time is time'
  }
];


// In-memory storage for blog posts
const posts = [];

module.exports = { users, posts };
