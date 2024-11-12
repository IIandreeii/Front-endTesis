import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostPage = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [organization, setOrganization] = useState('');

    useEffect(() => {
        axios.get('/posts')
            .then(response => setPosts(response.data))
            .catch(error => console.error('Error fetching posts:', error));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/posts', { content, organization })
            .then(response => setPosts([...posts, response.data]))
            .catch(error => console.error('Error creating post:', error));
    };

    const handleLike = (postId) => {
        axios.post(`/posts/${postId}/like`, { userId: 'user123' })
            .then(response => {
                const updatedPosts = posts.map(post => post._id === postId ? response.data : post);
                setPosts(updatedPosts);
            })
            .catch(error => console.error('Error liking post:', error));
    };

    return (
        <div>
            <h1>Posts</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Content"
                />
                <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Organization"
                />
                <button type="submit">Create Post</button>
            </form>
            <ul>
                {posts.map(post => (
                    <li key={post._id}>
                        <p>{post.content}</p>
                        <p>{post.organization}</p>
                        <button onClick={() => handleLike(post._id)}>Like ({post.likes.length})</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PostPage;
