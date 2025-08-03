const logger = require('../utils/logger');

function allowRoles(...roles) {
    return (req, res, next) => {
        try {
            // Fail securely - ensure user is authenticated first
            if (!req.user) {
                // LOG ACCESS CONTROL FAILURE (2.4.7)
                logger.warn('ACCESS_CONTROL', { 
                    success: false,
                    reason: 'No authenticated user for role check',
                    requiredRoles: roles,
                    ip: req.ip, 
                    path: req.path,
                    timestamp: new Date().toISOString()
                });
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required' 
                });
            }

            if (!roles.includes(req.user.role)) {
                // LOG ROLE-BASED ACCESS DENIAL (2.4.7)
                logger.warn('ACCESS_CONTROL', { 
                    success: false,
                    reason: 'Insufficient role permissions',
                    userId: req.user.id,
                    userRole: req.user.role,
                    requiredRoles: roles,
                    path: req.path,
                    ip: req.ip,
                    timestamp: new Date().toISOString()
                });
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access denied. Insufficient permissions.' 
                });
            }

            // LOG SUCCESSFUL ROLE-BASED ACCESS (2.4.7)
            logger.info('ACCESS_CONTROL', { 
                success: true,
                reason: 'Role permission granted',
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: roles,
                path: req.path,
                timestamp: new Date().toISOString()
            });
            
            next();
        } catch (error) {
            logger.error('Role middleware error', { 
                error: error.message, 
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ 
                success: false, 
                message: 'Authorization failed' 
            });
        }
    };
}

module.exports = { allowRoles };