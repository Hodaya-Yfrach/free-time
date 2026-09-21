// ============================================================================
//  socket.js — חיבור Socket.IO יחיד לכל האפליקציה
<<<<<<< HEAD
//  ----------------------------------------------------------------------
//  יוצרים את החיבור פעם אחת ומייצאים אותו. כך כל רכיב מדבר
//  עם אותו socket, ואין סכנה לפתוח חיבור כפול בכל רינדור.
=======
>>>>>>> upgrade-v3
// ============================================================================

import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL
  || (import.meta.env.DEV ? 'http://localhost:3000' : undefined);
export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

<<<<<<< HEAD
/**
 * עטיפה נוחה לאירוע עם תשובה (ack) בתור Promise,
 * במקום לפזר callbacks בכל הקוד.
 */
=======
>>>>>>> upgrade-v3
export function request(event, payload) {
  return new Promise((resolve) => {
    socket.timeout(5000).emit(event, payload, (err, response) => {
      resolve(err ? null : response);
    });
  });
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
