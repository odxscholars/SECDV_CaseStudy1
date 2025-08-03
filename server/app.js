require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

// Simple logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Import routes (comment out problematic ones first)
try {
    const authRoutes = require('./routes/auth.routes');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.log('❌ Auth routes failed:', error.message);
}

try {
    const { verifyToken } = require('./middlewares/auth.middleware');
    const userRoutes = require('./routes/user.routes');
    app.use('/api/users', verifyToken, userRoutes);
    console.log('✅ User routes loaded');
} catch (error) {
    console.log('❌ User routes failed:', error.message);
}

try {
    const { verifyToken } = require('./middlewares/auth.middleware');
    const { allowRoles } = require('./middlewares/role.middleware');
    const logRoutes = require('./routes/log.routes');
    app.use('/api/logs', verifyToken, allowRoles('admin'), logRoutes);
    console.log('✅ Log routes loaded');
} catch (error) {
    console.log('❌ Log routes failed:', error.message);
}

try {
    const { verifyToken } = require('./middlewares/auth.middleware');
    const postRoutes = require('./routes/post.routes');
    app.use('/api/posts', verifyToken, postRoutes);
    console.log('✅ Post routes loaded');
} catch (error) {
    console.log('❌ Post routes failed:', error.message);
}

// Static files
app.use('/src', express.static(path.join(__dirname, '../src')));
app.use('/', express.static(path.join(__dirname, '../public')));

// Basic error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});