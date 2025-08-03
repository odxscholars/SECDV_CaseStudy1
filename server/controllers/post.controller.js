const { posts } = require('../database');
const { addLog } = require('./log.controller');

let nextId = 1;

const listPosts = (req, res) => {
    const visible = ['manager', 'admin'].includes(req.user.role)
        ? posts
        : posts.filter(p => p.authorId === req.user.id);
    res.json(visible);
};

const createPost = (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    const now = new Date().toISOString();
    const post = {
        id: nextId++,
        content,
        authorId: req.user.id,
        author: req.user.username,
        createdAt: now,
        updatedAt: now
    };
    posts.push(post);
    addLog(`Created post ID ${post.id}`, req.user.username);
    res.json(post);
};

const updatePost = (req, res) => {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    const post = posts.find(p => p.id === id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const canEdit = ['manager', 'admin'].includes(req.user.role) || post.authorId === req.user.id;
    if (!canEdit) return res.status(403).json({ message: 'Forbidden' });
    post.content = content || post.content;
    post.updatedAt = new Date().toISOString();
    addLog(`Updated post ID ${id}`, req.user.username);
    res.json(post);
};

const deletePost = (req, res) => {
    const id = parseInt(req.params.id);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Post not found' });
    }
    const post = posts[index];
    const canDelete = ['manager', 'admin'].includes(req.user.role) || post.authorId === req.user.id;
    if (!canDelete) return res.status(403).json({ message: 'Forbidden' });
    posts.splice(index, 1);
    addLog(`Deleted post ID ${id}`, req.user.username);
    res.json({ message: 'Post deleted' });
};

module.exports = { listPosts, createPost, updatePost, deletePost };
