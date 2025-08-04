const db = require('../database');
const { findByUsername, createUserRecord } = require('../models/user.model');
const { addLog } = require('./log.controller');
const bcrypt = require('bcrypt');

let users = [];
db.all('SELECT * FROM users', (err, rows) => {
    if (!err) users = rows;
});

const createUser = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can create users' });
    }
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['admin', 'manager', 'employee'].includes(role)) {
        return res.status(403).json({ message: 'Invalid role' });
    }

    try {
        const exists = await findByUsername(username);
        if (exists) return res.status(409).json({ message: 'Username already exists' });

        const hash = await bcrypt.hash(password, 10);
        const newUser = await createUserRecord({ username, password: hash, role });
        users.push(newUser);

        addLog(`Created ${role} account for '${username}'`, req.user.username);

        res.json({ message: `User '${username}' created`, user: { id: newUser.id, username, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ message: 'User creation failed' });
    }
};


const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ message: 'User not found' });

    users.splice(index, 1);
    addLog(`Deleted user ID ${id}`, req.user.username);

    res.json({ message: 'User deleted' });
};

const updateUserRole = (req, res) => {
    const id = parseInt(req.params.id);
    const { role } = req.body;

    if (!['admin', 'manager', 'employee'].includes(role)) {
        return res.status(403).json({ message: 'Invalid role' });
    }

    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.id === req.user.id) {
        return res.status(403).json({ message: 'Admins cannot change their own role' });
    }

    user.role = role;
    addLog(`Changed role of user ID ${id} to ${role}`, req.user.username);
    res.json({ message: 'Role updated', user: { id: user.id, username: user.username, role } });
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    for (const oldHash of user.passwordHistory || []) {
        const reused = await bcrypt.compare(newPassword, oldHash);
        if (reused) {
            return res.status(400).json({ message: 'You cannot reuse a previous password' });
        }
    }

    const now = new Date();
    const lastChange = new Date(user.lastPasswordChange);
    const hoursSinceChange = (now - lastChange) / (1000 * 60 * 60);

    if (hoursSinceChange < 24) {
        return res.status(400).json({ message: 'You can only change your password once every 24 hours' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.password = newHash;
    user.lastPasswordChange = new Date().toISOString();

    if (!user.passwordHistory) user.passwordHistory = [];
    user.passwordHistory.push(newHash);

    if (user.passwordHistory.length > 5) {
        user.passwordHistory = user.passwordHistory.slice(-5);
    }

    addLog(`Changed password for user ID ${user.id}`, user.username);
    res.json({ message: 'Password updated' });
};


const listUsers = (req, res) => {
    const filtered = req.user.role === 'manager'
        ? users.filter(u => u.role === 'employee')
        : users;
    res.json(filtered);
};

const getProfile = (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, username: user.username, role: user.role });
};

const updateRecovery = (req, res) => {
    const { recoveryQuestionA, recoveryAnswerA, recoveryQuestionB, recoveryAnswerB } = req.body;
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (!recoveryQuestionA || !recoveryAnswerA || !recoveryQuestionB || !recoveryAnswerB) {
        return res.status(400).json({ message: 'All recovery fields are required' });
    }

    if (recoveryQuestionA === recoveryQuestionB) {
        return res.status(400).json({ message: 'Recovery questions must be different' });
    }

    user.recoveryQuestionA = recoveryQuestionA;
    user.recoveryAnswerA = recoveryAnswerA;
    user.recoveryQuestionB = recoveryQuestionB;
    user.recoveryAnswerB = recoveryAnswerB;

    addLog(`Updated recovery questions for user ID ${user.id}`, user.username);
    res.json({ message: 'Recovery questions updated successfully' });
};

const validateReset = (req, res) => {
    const { username, questionA, answerA, questionB, answerB } = req.body;

    if (!username || !questionA || !answerA || !questionB || !answerB) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ message: 'Invalid username or recovery answers.' });

    const normalize = str => str.trim().toLowerCase();

    const q1 = questionA, a1 = normalize(answerA);
    const q2 = questionB, a2 = normalize(answerB);

    const uq1 = user.recoveryQuestionA, ua1 = normalize(user.recoveryAnswerA || '');
    const uq2 = user.recoveryQuestionB, ua2 = normalize(user.recoveryAnswerB || '');

    const directMatch =
        (q1 === uq1 && a1 === ua1 && q2 === uq2 && a2 === ua2);

    const swappedMatch =
        (q1 === uq2 && a1 === ua2 && q2 === uq1 && a2 === ua1);

    if (directMatch || swappedMatch) {
        return res.json({ message: 'Recovery answers verified.' });
    }

    return res.status(401).json({ message: 'Invalid username or recovery answers.' });
};

const resetPasswordWithoutAuth = async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ message: 'Invalid inputs.' });
  }

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  // Ensure passwordHistory is initialized
  if (!user.passwordHistory) user.passwordHistory = [];

  // Check if the new password matches any previously used password
  for (const oldHash of user.passwordHistory) {
    const reused = await bcrypt.compare(newPassword, oldHash);
    if (reused) {
      return res.status(400).json({ message: 'You cannot reuse a previous password.' });
    }
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  user.password = newHash;
  user.lastPasswordChange = new Date().toISOString();
  user.passwordHistory.push(newHash);

  // Keep only last 5 passwords
  if (user.passwordHistory.length > 5) {
    user.passwordHistory = user.passwordHistory.slice(-5);
  }

  addLog(`Password reset via recovery for '${username}'`, username);
  res.json({ message: 'Password successfully reset.' });
};

module.exports = {
    listUsers,
    getProfile,
    createUser,
    deleteUser,
    updateUserRole,
    changePassword,
    updateRecovery,
    validateReset,
    resetPasswordWithoutAuth
};
