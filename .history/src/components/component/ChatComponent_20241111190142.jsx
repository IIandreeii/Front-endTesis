"use client";

import React, { useState, useEffect } from 'react';

const ChatComponent = ({ userId, organizationId }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.emit('joinRoom', { userId, organizationId });

        socket.on('receiveMessage', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [userId, organizationId]);

    const sendMessage = () => {
        socket.emit('sendMessage', { userId, organizationId, message });
        setMessage('');
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg.message}</div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Enviar</button>
        </div>
    );
};

export default ChatComponent;
