const express = require('express');
const { login, register, session } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/session', session);
module.exports = router;
