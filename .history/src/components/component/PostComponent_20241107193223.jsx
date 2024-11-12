"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostComponent = ({ organizationId, userId }) => {
    const [content, setContent] = useState('');
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:3001/posts');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    const createPost = async () => {
        try {
            const response = await axios.post('http://localhost:3002/posts', {
                content,
                organization: organizationId,
            });
            setPosts((prevPosts) => [...prevPosts, response.data]);
            setContent('');
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const likePost = async (postId) => {
        try {
            const response = await axios.post(`http://localhost:3002/posts/${postId}/like`, {
                userId,
            });
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, likes: response.data.likes } : post
                )
            );
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    return (
        <div>
            <div>
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <button onClick={createPost}>Publicar</button>
            </div>
            <div>
                {posts.map((post) => (
                    <div key={post._id}>
                        <p>{post.content}</p>
                        <button onClick={() => likePost(post._id)}>
                            Like ({post.likes.length})
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostComponent;
