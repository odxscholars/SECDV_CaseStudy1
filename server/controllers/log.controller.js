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
    const { q } = req.query;
    const filtered = q
        ? logs.filter(l =>
            l.action.toLowerCase().includes(q.toLowerCase()) ||
            l.user.toLowerCase().includes(q.toLowerCase()))
        : logs;
    res.json(filtered);
};

module.exports = { getLogs, addLog };
