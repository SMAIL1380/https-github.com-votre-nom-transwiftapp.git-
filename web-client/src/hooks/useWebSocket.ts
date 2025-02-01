import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export const useWebSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Initialiser la connexion WebSocket
    socketRef.current = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      auth: {
        token,
      },
    });

    // Gestionnaires d'événements
    socketRef.current.on('connect', () => {
      console.log('WebSocket connecté');
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket déconnecté');
    });

    socketRef.current.on('error', (error) => {
      console.error('Erreur WebSocket:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return socketRef.current;
};
