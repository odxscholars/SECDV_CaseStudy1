const { info } = require('../utils/logger');
const logs = [];

function addLog(action, user) {
    info(action, user);
    logs.push({
        id: logs.length + 1,
        action,
        user,
        timestamp: new Date().toISOString()
    });
}

const getLogs = (req, res) => {
    res.json(logs);
};

module.exports = { getLogs, addLog };
