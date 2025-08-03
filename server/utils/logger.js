const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.File({ 
            filename: path.join(logDir, 'security.log'),
            level: 'info'
        }),
        new winston.transports.File({ 
            filename: path.join(logDir, 'app.log'),
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Security-specific logging functions
logger.logSecurityEvent = (event, details) => {
    logger.info('SECURITY_EVENT', { 
        event, 
        timestamp: new Date().toISOString(),
        ...details 
    });
};

logger.logAuthAttempt = (success, details) => {
    const level = success ? 'info' : 'warn';
    logger[level]('AUTH_ATTEMPT', { 
        success, 
        timestamp: new Date().toISOString(),
        ...details 
    });
};

logger.logAccessControl = (success, details) => {
    const level = success ? 'info' : 'warn';
    logger[level]('ACCESS_CONTROL', { 
        success, 
        timestamp: new Date().toISOString(),
        ...details 
    });
};

// Legacy function for compatibility
function legacyInfo(action, user) {
    logger.info('Legacy log entry', { action, user });
}

// Export the logger and legacy function
module.exports = logger;
module.exports.info = legacyInfo;