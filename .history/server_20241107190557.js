const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let posts = [];

app.get('/posts', (req, res) => {
    res.json(posts);
});

app.post('/posts', (req, res) => {
    const { content, organization } = req.body;
    const newPost = { _id: Date.now().toString(), content, organization, likes: [] };
    posts.push(newPost);
    res.json(newPost);
});

app.post('/posts/:postId/like', (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;
    const post = posts.find(p => p._id === postId);
    if (post) {
        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
        }
        res.json(post);
    } else {
        res.status(404).send('Post not found');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
