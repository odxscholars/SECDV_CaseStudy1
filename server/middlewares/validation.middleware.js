const validator = require('validator');
const xss = require('xss');
const logger = require('../utils/logger');

// Enhanced input validation
const validateInput = (req, res, next) => {
    try {
        const errors = [];

        // Validate common fields
        if (req.body.email && !validator.isEmail(req.body.email)) {
            errors.push('Invalid email format');
        }

        if (req.body.username) {
            if (!validator.isLength(req.body.username, { min: 3, max: 30 })) {
                errors.push('Username must be between 3 and 30 characters');
            }
            if (!validator.isAlphanumeric(req.body.username)) {
                errors.push('Username must contain only letters and numbers');
            }
        }

        if (req.body.password && !validator.isLength(req.body.password, { min: 8 })) {
            errors.push('Password must be at least 8 characters long');
        }

        if (errors.length > 0) {
            logger.warn('Input validation failed', { 
                errors, 
                ip: req.ip,
                path: req.path 
            });
            return res.status(400).json({
                success: false,
                message: 'Input validation failed',
                errors
            });
        }

        next();
    } catch (error) {
        logger.error('Validation middleware error', { 
            error: error.message, 
            ip: req.ip 
        });
        res.status(500).json({
            success: false,
            message: 'Validation failed'
        });
    }
};

// XSS protection
const sanitizeInput = (req, res, next) => {
    const sanitizeObject = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = xss(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObject(obj[key]);
            }
        }
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);

    next();
};

module.exports = { validateInput, sanitizeInput };