const { users } = require('../database');
const bcrypt = require('bcrypt');

let nextId = users.length + 1;

const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = users.find(u => u.username === username);
    if (exists) return res.status(409).json({ message: 'Username already exists' });

    const hash = await bcrypt.hash(password, 10);
    const newUser = { id: nextId++, username, password: hash, role };
    users.push(newUser);
    res.json({ message: 'User created', user: { id: newUser.id, username, role } });
};

const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ message: 'User not found' });

    users.splice(index, 1);
    res.json({ message: 'User deleted' });
};

const updateUserRole = (req, res) => {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    res.json({ message: 'Role updated', user: { id: user.id, username: user.username, role } });
};
const listUsers = (req, res) => {
    const filtered = req.user.role === 'manager'
        ? users.filter(u => u.role === 'employee')
        : users;
    res.json(filtered);
};
const getProfile = (req, res) => {
    const user = findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, username: user.username, role: user.role });
};

module.exports = {
    listUsers,
    getProfile,
    createUser,
    deleteUser,
    updateUserRole
};
