// ============================================================================
//  socket.js — חיבור Socket.IO יחיד לכל האפליקציה
//  ----------------------------------------------------------------------
//  יוצרים את החיבור פעם אחת ומייצאים אותו. כך כל רכיב מדבר
//  עם אותו socket, ואין סכנה לפתוח חיבור כפול בכל רינדור.
// ============================================================================

import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

/**
 * עטיפה נוחה לאירוע עם תשובה (ack) בתור Promise,
 * במקום לפזר callbacks בכל הקוד.
 */
export function request(event, payload) {
  return new Promise((resolve) => {
    socket.timeout(5000).emit(event, payload, (err, response) => {
      resolve(err ? null : response);
    });
  });
}
