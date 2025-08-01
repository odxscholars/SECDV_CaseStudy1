const logs = [
    { id: 1, action: 'Login', user: 'admin' },
    { id: 2, action: 'Viewed audit logs', user: 'admin' },
];

const getLogs = (req, res) => {
    res.json(logs);
};

module.exports = { getLogs };
