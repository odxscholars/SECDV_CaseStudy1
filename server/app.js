require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const logRoutes = require('./routes/log.routes');
const postRoutes = require('./routes/post.routes');

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/posts', postRoutes);
app.use('/src', express.static(path.join(__dirname, '../src')));
app.use('/', express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
