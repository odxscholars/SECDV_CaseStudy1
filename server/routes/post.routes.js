const express = require('express');
const { listPosts, createPost, deletePost } = require('../controllers/post.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', listPosts);
router.post('/', verifyToken, createPost);
router.delete('/:id', verifyToken, allowRoles('admin', 'manager'), deletePost);

module.exports = router;
