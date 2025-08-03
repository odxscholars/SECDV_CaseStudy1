const jwt = require('jsonwebtoken');
const { findById } = require('../models/user.model');
const logger = require('../utils/logger');
const SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        // Fail securely - default to no access
        if (!authHeader) {
            // LOG ACCESS CONTROL FAILURE (2.4.7)
            logger.warn('ACCESS_CONTROL', { 
                success: false,
                reason: 'Missing authorization header',
                ip: req.ip, 
                path: req.path,
                timestamp: new Date().toISOString()
            });
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. Authentication required.' 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            // LOG ACCESS CONTROL FAILURE (2.4.7)
            logger.warn('ACCESS_CONTROL', { 
                success: false,
                reason: 'Malformed authorization header',
                ip: req.ip, 
                path: req.path,
                timestamp: new Date().toISOString()
            });
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. Invalid token format.' 
            });
        }

        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) {
                // LOG ACCESS CONTROL FAILURE (2.4.7)
                logger.warn('ACCESS_CONTROL', { 
                    success: false,
                    reason: 'Invalid token',
                    error: err.message,
                    ip: req.ip, 
                    path: req.path,
                    timestamp: new Date().toISOString()
                });
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access denied. Invalid or expired token.' 
                });
            }

            // Verify user still exists
            const user = findById(decoded.id);
            if (!user) {
                // LOG ACCESS CONTROL FAILURE (2.4.7)
                logger.warn('ACCESS_CONTROL', { 
                    success: false,
                    reason: 'User not found',
                    userId: decoded.id,
                    ip: req.ip,
                    path: req.path,
                    timestamp: new Date().toISOString()
                });
                return res.status(401).json({ 
                    success: false, 
                    message: 'Access denied. User not found.' 
                });
            }

            req.user = decoded;
            
            // LOG SUCCESSFUL ACCESS CONTROL (2.4.7)
            logger.info('ACCESS_CONTROL', { 
                success: true,
                userId: decoded.id, 
                username: decoded.username,
                path: req.path,
                timestamp: new Date().toISOString()
            });
            
            next();
        });
    } catch (error) {
        logger.error('Authentication middleware error', { 
            error: error.message, 
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ 
            success: false, 
            message: 'Authentication failed' 
        });
    }
}

module.exports = { verifyToken };