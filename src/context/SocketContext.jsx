import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is logged in
    if (user) {
      // Use same host as API (strip /api). Default production so deployed app does not hit localhost.
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? 'https://studify.developteam.site/api' : 'http://localhost:6008/api');
      const socketUrl = apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:6008';
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
      });
      newSocket.on('connect_error', () => {
        // Silent: backend may not have socket or may be on different port
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
