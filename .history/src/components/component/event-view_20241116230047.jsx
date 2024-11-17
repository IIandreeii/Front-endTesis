// FILE: src/components/Publications.js
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const Publications = () => {
    const [publications, setPublications] = useState([]);

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                const response = await axios.get('/api/publications');
                setPublications(response.data);
            } catch (error) {
                console.error('Error fetching publications:', error);
            }
        };

        fetchPublications();

        socket.on('newPublication', (publication) => {
            setPublications((prevPublications) => [publication, ...prevPublications]);
        });

        socket.on('updatePublication', (updatedPublication) => {
            setPublications((prevPublications) =>
                prevPublications.map((publication) =>
                    publication._id === updatedPublication._id ? updatedPublication : publication
                )
            );
        });

        socket.on('newComment', (newComment) => {
            setPublications((prevPublications) =>
                prevPublications.map((publication) =>
                    publication._id === newComment.publicationId
                        ? { ...publication, comments: [...publication.comments, newComment] }
                        : publication
                )
            );
        });

        return () => {
            socket.off('newPublication');
            socket.off('updatePublication');
            socket.off('newComment');
        };
    }, []);

    return (
        <div>
            {publications.map(publication => (
                <div key={publication._id}>
                    <h2>{publication.title}</h2>
                    <p>{publication.description}</p>
                    {publication.imageUrl && <img src={publication.imageUrl} alt={publication.title} />}
                    <p>{publication.location}</p>
                    <p>{new Date(publication.date).toLocaleString()}</p>
                    <p>Likes: {publication.likes}</p>
                    <div>
                        {publication.comments.map((comment, index) => (
                            <p key={index}><strong>{comment.user}:</strong> {comment.comment}</p>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Publications;