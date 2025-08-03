const { posts } = require('../database');
const { addLog } = require('./log.controller');

let nextId = 1;

const listPosts = (req, res) => {
    res.json(posts);
};

const createPost = (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    const post = { id: nextId++, content, author: req.user.username };
    posts.push(post);
    addLog(`Created post ID ${post.id}`, req.user.username);
    res.json(post);
};

const deletePost = (req, res) => {
    const id = parseInt(req.params.id);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Post not found' });
    }
    posts.splice(index, 1);
    addLog(`Deleted post ID ${id}`, req.user.username);
    res.json({ message: 'Post deleted' });
};

module.exports = { listPosts, createPost, deletePost };
