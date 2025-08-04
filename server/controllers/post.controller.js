const db = require('../database');
const { addLog } = require('./log.controller');

const listPosts = (req, res) => {
    db.all('SELECT * FROM posts', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching posts' });
        res.json(rows);
    });
};

const createPost = (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    const timestamp = new Date().toISOString();
    db.run(
        'INSERT INTO posts (content, author, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
        [content, req.user.username, timestamp, timestamp],
        function (err) {
            if (err) return res.status(500).json({ message: 'Error creating post' });
            addLog(`Created post ID ${this.lastID}`, req.user.username);
            res.json({ id: this.lastID, content, author: req.user.username, createdAt: timestamp, updatedAt: timestamp });
        }
    );
};

const updatePost = (req, res) => {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, post) => {
        if (err) return res.status(500).json({ message: 'Error retrieving post' });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author !== req.user.username && !['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updatedAt = new Date().toISOString();
        db.run('UPDATE posts SET content = ?, updatedAt = ? WHERE id = ?', [content, updatedAt, id], err2 => {
            if (err2) return res.status(500).json({ message: 'Error updating post' });
            addLog(`Updated post ID ${id}`, req.user.username);
            res.json({ ...post, content, updatedAt });
        });
    });
};

const deletePost = (req, res) => {
    const id = parseInt(req.params.id);
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, post) => {
        if (err) return res.status(500).json({ message: 'Error retrieving post' });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author !== req.user.username && !['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        db.run('DELETE FROM posts WHERE id = ?', [id], err2 => {
            if (err2) return res.status(500).json({ message: 'Error deleting post' });
            addLog(`Deleted post ID ${id}`, req.user.username);
            res.json({ message: 'Post deleted' });
        });
    });
};

module.exports = { listPosts, createPost, updatePost, deletePost };

