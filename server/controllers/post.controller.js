const { posts } = require('../database');
const { addLog } = require('./log.controller');

let nextId = 1;

const listPosts = (req, res) => {
    // Allow all authenticated users to view every post
    res.json(posts);
};

const createPost = (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    const timestamp = new Date().toISOString();
    const post = { id: nextId++, content, author: req.user.username, createdAt: timestamp, updatedAt: timestamp };
    posts.push(post);
    addLog(`Created post ID ${post.id}`, req.user.username);
    res.json(post);
};

const updatePost = (req, res) => {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    const post = posts.find(p => p.id === id);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author !== req.user.username && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    post.content = content;
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
    if (post.author !== req.user.username && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    posts.splice(index, 1);
    addLog(`Deleted post ID ${id}`, req.user.username);
    res.json({ message: 'Post deleted' });
};

module.exports = { listPosts, createPost, updatePost, deletePost };
