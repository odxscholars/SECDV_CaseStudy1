const express = require('express');
const { getLogs } = require('../controllers/log.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', verifyToken, allowRoles('admin'), getLogs);

module.exports = router;
