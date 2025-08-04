const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Keep the legacy in-memory logs for backward compatibility
const logs = [];

// Legacy function - keep for backward compatibility
function addLog(action, user) {
    logger.info('Legacy log entry', { action, user });
    logs.push({
        id: logs.length + 1,
        action,
        user,
        timestamp: new Date().toISOString()
    });
}

const getLogs = (req, res) => {
    try {
        const { q, type = 'all', start, end } = req.query;
        const logDir = path.join(__dirname, '../logs');
        
        let result = {
            success: true,
            logs: {
                security: [],
                errors: [],
                application: [],
                legacy: logs // Keep your existing in-memory logs
            },
            totalEntries: {
                security: 0,
                errors: 0,
                application: 0,
                legacy: logs.length
            }
        };

        // Read security logs
        const securityLogPath = path.join(logDir, 'security.log');
        if (fs.existsSync(securityLogPath)) {
            try {
                const securityContent = fs.readFileSync(securityLogPath, 'utf8');
                const securityLines = securityContent.split('\n').filter(line => line.trim());
                result.logs.security = securityLines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return { message: line, timestamp: new Date().toISOString() };
                    }
                }).slice(-100); // Get last 100 entries
                result.totalEntries.security = result.logs.security.length;
            } catch (error) {
                logger.error('Error reading security logs', { error: error.message });
            }
        }

        // Read error logs
        const errorLogPath = path.join(logDir, 'error.log');
        if (fs.existsSync(errorLogPath)) {
            try {
                const errorContent = fs.readFileSync(errorLogPath, 'utf8');
                const errorLines = errorContent.split('\n').filter(line => line.trim());
                result.logs.errors = errorLines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return { message: line, timestamp: new Date().toISOString() };
                    }
                }).slice(-50); // Get last 50 error entries
                result.totalEntries.errors = result.logs.errors.length;
            } catch (error) {
                logger.error('Error reading error logs', { error: error.message });
            }
        }

        // Read application logs
        const appLogPath = path.join(logDir, 'app.log');
        if (fs.existsSync(appLogPath)) {
            try {
                const appContent = fs.readFileSync(appLogPath, 'utf8');
                const appLines = appContent.split('\n').filter(line => line.trim());
                result.logs.application = appLines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return { message: line, timestamp: new Date().toISOString() };
                    }
                }).slice(-50); // Get last 50 app entries
                result.totalEntries.application = result.logs.application.length;
            } catch (error) {
                logger.error('Error reading application logs', { error: error.message });
            }
        }

        // Apply timestamp filter if provided
        const startTime = start ? new Date(start) : null;
        const endTime = end ? new Date(end) : null;
        if (startTime || endTime) {
            const inRange = log => {
                const t = new Date(log.timestamp || log.time || log.date);
                if (startTime && t < startTime) return false;
                if (endTime && t > endTime) return false;
                return true;
            };
            result.logs.security = result.logs.security.filter(inRange);
            result.logs.errors = result.logs.errors.filter(inRange);
            result.logs.application = result.logs.application.filter(inRange);
            result.logs.legacy = result.logs.legacy.filter(inRange);
        }

        // Apply search filter if provided
        if (q) {
            const searchTerm = q.toLowerCase();
            
            // Filter security logs
            result.logs.security = result.logs.security.filter(log => 
                JSON.stringify(log).toLowerCase().includes(searchTerm)
            );
            
            // Filter error logs
            result.logs.errors = result.logs.errors.filter(log => 
                JSON.stringify(log).toLowerCase().includes(searchTerm)
            );
            
            // Filter application logs
            result.logs.application = result.logs.application.filter(log => 
                JSON.stringify(log).toLowerCase().includes(searchTerm)
            );
            
            // Filter legacy logs (maintain your existing logic)
            result.logs.legacy = logs.filter(l =>
                l.action.toLowerCase().includes(searchTerm) ||
                l.user.toLowerCase().includes(searchTerm)
            );
        }

        // Return specific log type if requested
        if (type !== 'all') {
            switch (type) {
                case 'security':
                    result.logs = { security: result.logs.security };
                    break;
                case 'errors':
                    result.logs = { errors: result.logs.errors };
                    break;
                case 'application':
                    result.logs = { application: result.logs.application };
                    break;
                case 'legacy':
                    result.logs = { legacy: result.logs.legacy };
                    break;
            }
        }

        // Log the admin access to logs (security requirement 2.4.4)
        logger.logSecurityEvent('ADMIN_LOG_ACCESS', {
            adminId: req.user.id,
            adminUsername: req.user.username,
            ip: req.ip,
            searchQuery: q || null,
            logType: type,
            timestamp: new Date().toISOString()
        });

        res.json(result);

    } catch (error) {
        logger.error('Log retrieval error', { 
            error: error.message, 
            adminId: req.user?.id,
            adminUsername: req.user?.username,
            ip: req.ip
        });
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve logs' 
        });
    }
};

module.exports = { getLogs, addLog };