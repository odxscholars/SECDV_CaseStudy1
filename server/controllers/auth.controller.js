const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findByUsername, createUserRecord } = require('../models/user.model');
const logger = require('../utils/logger');
const SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Input validation
        if (!username || !password) {
            // LOG VALIDATION FAILURE (2.4.5)
            logger.warn('VALIDATION_FAILURE', { 
                reason: 'Missing credentials', 
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Default to failure for security
        let loginSuccess = false;
        let user = null;
        
        try {
            user = findByUsername(username);
            console.log("User found:", user);  // TEMPORARY DEBUG
            if (user && await bcrypt.compare(password, user.password)) {
                loginSuccess = true;
            }
        } catch (error) {
            logger.error('Login verification error', { 
                username, 
                error: error.message,
                ip: req.ip 
            });
        }
        
        console.log("hello")
        if (!loginSuccess) {
            // LOG FAILED AUTH ATTEMPT (2.4.6)
            logger.warn('AUTH_ATTEMPT', { 
                success: false,
                username, 
                reason: 'Invalid credentials',
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // LOG SUCCESSFUL AUTH ATTEMPT (2.4.6)
        logger.info('AUTH_ATTEMPT', { 
            success: true,
            userId: user.id, 
            username: user.username,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            SECRET, 
            { expiresIn: '1h' }
        );
        
        req.session.user = { id: user.id, username: user.username, role: user.role };
        
        res.json({ 
            success: true, 
            token, 
            role: user.role 
        });
        
    } catch (error) {
        logger.error('Login controller error', { 
            error: error.message, 
            ip: req.ip 
        });
        res.status(500).json({ 
            success: false, 
            message: 'Login failed' 
        });
    }
};

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Enhanced input validation
        if (!username || !password) {
            // LOG VALIDATION FAILURE (2.4.5)
            logger.warn('VALIDATION_FAILURE', { 
                reason: 'Missing data',
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Validate username length
        if (username.length < 3 || username.length > 30) {
            // LOG VALIDATION FAILURE (2.4.5)
            logger.warn('VALIDATION_FAILURE', { 
                reason: 'Username length invalid',
                username: username.length,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({ 
                success: false, 
                message: 'Username must be between 3 and 30 characters' 
            });
        }

        // Validate password strength
        if (password.length < 8) {
            // LOG VALIDATION FAILURE (2.4.5)
            logger.warn('VALIDATION_FAILURE', { 
                reason: 'Password too short',
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 8 characters long' 
            });
        }

        // ADD MAXIMUM PASSWORD LENGTH VALIDATION (2.3.3)
        if (password.length > 128) {
            // LOG VALIDATION FAILURE (2.4.5)
            logger.warn('VALIDATION_FAILURE', { 
                reason: 'Password too long',
                passwordLength: password.length,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({ 
                success: false, 
                message: 'Password must not exceed 128 characters' 
            });
        }
        
        if (findByUsername(username)) {
            // LOG VALIDATION FAILURE (2.4.5)
            logger.warn('VALIDATION_FAILURE', { 
                reason: 'Username already exists',
                username,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            return res.status(409).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }
        
        const hashed = await bcrypt.hash(password, 12);
        const user = createUserRecord({ username, password: hashed, role: 'employee' });
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            SECRET, 
            { expiresIn: '1h' }
        );
        
        req.session.user = { id: user.id, username: user.username, role: user.role };
        
        logger.info('User registered successfully', { 
            userId: user.id, 
            username: user.username,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json({ 
            success: true, 
            token, 
            role: user.role 
        });
        
    } catch (error) {
        logger.error('Registration error', { 
            error: error.message, 
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed' 
        });
    }
};

const session = (req, res) => {
    try {
        if (req.session && req.session.user) {
            res.json({ 
                success: true, 
                user: req.session.user 
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }
    } catch (error) {
        logger.error('Session check error', { error: error.message });
        res.status(500).json({ 
            success: false, 
            message: 'Session check failed' 
        });
    }
};

const logout = (req, res) => {
    try {
        const userId = req.session?.user?.id;
        req.session.destroy(err => {
            if (err) {
                logger.error('Logout error', { 
                    userId, 
                    error: err.message 
                });
                return res.status(500).json({ 
                    success: false, 
                    message: 'Logout failed' 
                });
            }
            logger.info('User logged out', { userId });
            res.json({ 
                success: true, 
                message: 'Logged out successfully' 
            });
        });
    } catch (error) {
        logger.error('Logout controller error', { error: error.message });
        res.status(500).json({ 
            success: false, 
            message: 'Logout failed' 
        });
    }
};

module.exports = { login, register, session, logout };