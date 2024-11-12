import { useEffect, useState } from 'react';

const Chats = ({ userId }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener los chats al cargar el componente
    useEffect(() => {
        const fetchChats = async () => {
            try {
                // Asegúrate de que la URL sea correcta y el backend esté corriendo
                const response = await fetch(`http://localhost:5000/chats?userId=${userId}`);
                const data = await response.json();
                setChats(data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching chats');
                setLoading(false);
            }
        };

        fetchChats();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            {chats.length === 0 ? (
                <p>No chats available</p>
            ) : (
                <ul>
                    {chats.map(chat => (
                        <li key={chat.id}>
                            <div>
                                <img src={chat.avatar} alt={chat.name} />
                                <p>{chat.name}</p>
                                <p>{chat.lastMessage}</p>
                                <p>{chat.time}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Chats;
