const handleCommentSubmit = async (eventId) => {
  if (!isAuthenticated()) {
      router.push('/logind'); // Redirige al login si no está autenticado
      return;
  }

  const user = await getUserFromToken();
  if (!user) return;

  if (newComments[eventId]?.trim()) {
      const newComment = {
          id: Date.now(),
          user: {
              _id: user._id,
              nombre: user.nombre,
              apellido: user.apellido,
              email: user.email
          },
          comment: newComments[eventId].trim(),
          publicationId: eventId
      };

      console.log('Nuevo comentario:', newComment); // Agrega este console.log

      socket.emit('addComment', newComment);
      setNewComments(prev => ({ ...prev, [eventId]: '' }));
  }
};