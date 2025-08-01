const express = require('express');
const {
    listUsers,
    getProfile,
    createUser,
    deleteUser,
    updateUserRole
} = require('../controllers/user.controller');

const { verifyToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

// --- View All Users (Admin/Manager) ---
router.get('/', verifyToken, allowRoles('admin', 'manager'), listUsers);

// --- View Own Profile ---
router.get('/me', verifyToken, getProfile);

// --- Create User (Admin only) ---
router.post('/', verifyToken, allowRoles('admin'), createUser);

// --- Delete User (Admin only) ---
router.delete('/:id', verifyToken, allowRoles('admin'), deleteUser);

// --- Update User Role (Admin only) ---
router.put('/:id/role', verifyToken, allowRoles('admin'), updateUserRole);

module.exports = router;
