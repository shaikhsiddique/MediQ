import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

let socket = null;

export const getSocket = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Not authenticated');
  }

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
