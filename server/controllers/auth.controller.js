const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findByUsername, createUser } = require('../models/user.model');
const SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
    const { username, password } = req.body;
    const user = findByUsername(username);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '1h' });
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ token, role: user.role });
};

const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    if (findByUsername(username)) return res.status(409).json({ message: 'Username already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = createUser({ username, password: hashed, role: 'employee' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '1h' });
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.status(201).json({ token, role: user.role });
};

const session = (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};

module.exports = { login, register, session };
