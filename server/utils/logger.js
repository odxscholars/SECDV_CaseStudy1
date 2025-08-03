function info(action, user) {
    const entry = {
        level: 'info',
        timestamp: new Date().toISOString(),
        user,
        action
    };
    console.log(JSON.stringify(entry));
}

module.exports = { info };
