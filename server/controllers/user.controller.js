const { users } = require('../database');
const { addLog } = require('./log.controller');
const bcrypt = require('bcrypt');

let nextId = users.length + 1;

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

    const exists = users.find(u => u.username === username);
    if (exists) return res.status(409).json({ message: 'Username already exists' });

    const hash = await bcrypt.hash(password, 10);
    const newUser = { id: nextId++, username, password: hash, role, passwordHistory: [hash] };
    users.push(newUser);

    addLog(`Created ${role} account for '${username}'`, req.user.username);

    res.json({ message: `User '${username}' created`, user: { id: newUser.id, username, role: newUser.role } });
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

    const newHash = await bcrypt.hash(newPassword, 10);
    user.password = newHash;

    if (!user.passwordHistory) user.passwordHistory = [];
    user.passwordHistory.push(newHash);

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

module.exports = {
    listUsers,
    getProfile,
    createUser,
    deleteUser,
    updateUserRole,
    changePassword
};
