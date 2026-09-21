// ============================================================================
//  socket.js — חיבור Socket.IO יחיד לכל האפליקציה
// ============================================================================

import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL
  || (import.meta.env.DEV ? 'http://localhost:3000' : undefined);
export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export function request(event, payload) {
  return new Promise((resolve) => {
    socket.timeout(5000).emit(event, payload, (err, response) => {
      resolve(err ? null : response);
    });
  });
}