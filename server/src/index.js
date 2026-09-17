// ============================================================================
//  index.js — נקודת הכניסה של השרת
//  מרים Express ל-HTTP + Socket.IO לזמן אמת.
//  בפיתוח: הלקוח רץ ב-Vite על 5173 ומדבר עם השרת דרך CORS.
//  בייצור: השרת מגיש את client/dist כקבצים סטטיים.
// ============================================================================

import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { registerHandlers } from './socketHandlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

registerHandlers(io);

// בדיקת בריאות פשוטה — שימושי כשמעלים לשרת אמיתי
app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// הגשת הבילד של הלקוח (קיים רק אחרי npm run build בתיקיית client)
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🏅 קרב המדליה — שרת פעיל על http://localhost:${PORT}`);
});
