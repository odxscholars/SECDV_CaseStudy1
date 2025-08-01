const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findByUsername } = require('../models/user.model');
const SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
    const { username, password } = req.body;
    const user = findByUsername(username);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
};

module.exports = { login };
