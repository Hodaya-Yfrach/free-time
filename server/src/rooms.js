// ============================================================================
//  rooms.js — כל מצב המשחק בזיכרון השרת
//  ----------------------------------------------------------------------
//  מבנה הנתונים:
//    rooms: Map<roomCode, Room>
//    Room = { code, gameId, createdAt, players: Map<socketId, Player> }
//    Player = { id, name, points, level, activeMs, paused, aboveIds }
//
//  aboveIds = צילום מצב של מי היה מעליי בטבלה בפעם האחרונה שעליתי שלב.
//  משם אנחנו יודעים את מי בדיוק עקפתי מאז.
// ============================================================================

import { comparePlayers, rating } from './scoring.js';
import { GAMES, DEFAULT_GAME, isValidGame } from './games.js';

const rooms = new Map();
/** מיפוי מהיר: socketId → roomCode, כדי לא לסרוק את כל החדרים בכל אירוע */
const socketRoom = new Map();

/** ניקוי קוד חדר לפורמט אחיד: אותיות גדולות, בלי רווחים */
export function normalizeCode(code) {
  return String(code || 'DEFAULT').trim().toUpperCase().slice(0, 12) || 'DEFAULT';
}

function normalizeName(name) {
  return String(name || 'שחקנית').trim().slice(0, 20) || 'שחקנית';
}

/**
 * צירוף שחקן לחדר.
 * restoredProgress = ההתקדמות שהלקוח שמר בדפדפן עבור אותו חדר + אותו משחק.
 * אם השחקן עבר לחדר אחר, הלקוח פשוט לא ישלח אותה והוא יתחיל מאפס.
 */
export function joinRoom({ socketId, roomCode, name, gameId, restoredProgress }) {
  const code = normalizeCode(roomCode);
  const game = isValidGame(gameId) ? gameId : DEFAULT_GAME;

  let room = rooms.get(code);
  if (!room) {
    room = { code, gameId: game, createdAt: Date.now(), players: new Map(), leaderId: null };
    rooms.set(code, room);
  }

  const player = {
    id: socketId,
    name: normalizeName(name),
    // המשחק שהשחקן משחק בפועל. חדר יכול להכיל כמה משחקים,
    // ולוח התוצאות מסונן לפי המשחק של הצופה.
    gameId: game,
    points: Math.max(0, Number(restoredProgress?.points) || 0),
    level: Math.max(1, Number(restoredProgress?.level) || 1),
    activeMs: Math.max(0, Number(restoredProgress?.activeMs) || 0),
    paused: false,
    aboveIds: [],
    joinedAt: Date.now(),
  };

  room.players.set(socketId, player);
  socketRoom.set(socketId, code);

  // צילום מצב ראשוני: מי כרגע מעליי
  player.aboveIds = idsAbove(room, player);

  return { room, player };
}

/** כל השחקנים בחדר שמשחקים את אותו משחק, ממוינים לפי דירוג */
export function sortedPlayers(room, gameId) {
  if (!room) return [];
  return [...room.players.values()]
    .filter((p) => !gameId || p.gameId === gameId)
    .sort(comparePlayers);
}

/** לוח תוצאות מוכן לשליחה ללקוח (כולל דירוג מחושב) */
export function leaderboard(room, gameId) {
  return sortedPlayers(room, gameId).map((p, index) => ({
    id: p.id,
    name: p.name,
    points: p.points,
    level: p.level,
    activeMs: p.activeMs,
    paused: p.paused,
    rating: rating(p),
    place: index + 1,
  }));
}

function idsAbove(room, player) {
  const list = sortedPlayers(room, player.gameId);
  const myIndex = list.findIndex((p) => p.id === player.id);
  return list.slice(0, Math.max(0, myIndex)).map((p) => p.id);
}

export function getRoomOf(socketId) {
  const code = socketRoom.get(socketId);
  return code ? rooms.get(code) : null;
}

export function getPlayer(socketId) {
  const room = getRoomOf(socketId);
  return room ? room.players.get(socketId) : null;
}

/**
 * עדכון ניקוד. מגן מפני "נסיגה" בניקוד (למשל הודעה שהגיעה באיחור),
 * אבל מאפשר לאפס במפורש כשהשחקן מתחיל חדר חדש.
 */
export function updateScore(socketId, { points, level, activeMs }) {
  const player = getPlayer(socketId);
  if (!player) return null;

  if (Number.isFinite(points) && points >= player.points) player.points = points;
  if (Number.isFinite(level) && level > player.level) player.level = level;
  if (Number.isFinite(activeMs) && activeMs >= player.activeMs) player.activeMs = activeMs;

  return player;
}

export function setPaused(socketId, paused) {
  const player = getPlayer(socketId);
  if (!player) return null;
  player.paused = !!paused;
  return player;
}

/**
 * סיכום עליית שלב — הלב של מסך הקונפטי.
 * מחזיר את המקום שלי, כמה שחקנים יש בסך הכול,
 * את מי עקפתי מאז עליית השלב הקודמת, ואת שלושת המובילים.
 */
export function levelUpSummary(socketId) {
  const room = getRoomOf(socketId);
  const player = room?.players.get(socketId);
  if (!room || !player) return null;

  const list = sortedPlayers(room, player.gameId);
  const myIndex = list.findIndex((p) => p.id === player.id);
  const nowBelowIds = new Set(list.slice(myIndex + 1).map((p) => p.id));

  // עקפתי = מי שהיה מעליי בצילום הקודם, ועכשיו נמצא מתחתיי
  const overtaken = player.aboveIds
    .filter((id) => nowBelowIds.has(id))
    .map((id) => room.players.get(id)?.name)
    .filter(Boolean);

  // מעדכנים צילום מצב לקראת השלב הבא
  player.aboveIds = list.slice(0, Math.max(0, myIndex)).map((p) => p.id);

  return {
    level: player.level,
    place: myIndex + 1,
    totalPlayers: list.length,
    overtaken,
    top3: list.slice(0, 3).map((p, i) => ({
      place: i + 1,
      name: p.name,
      points: p.points,
      rating: rating(p),
      isMe: p.id === socketId,
    })),
  };
}

/** רשימת החדרים הפעילים למסך "איתור חדרים" */
export function listActiveRooms() {
  const result = [];
  for (const room of rooms.values()) {
    if (room.players.size === 0) continue;
    const list = sortedPlayers(room);
    const top = list[0];
    // אילו משחקים משוחקים כרגע בחדר
    const gameIds = [...new Set(list.map((p) => p.gameId))];
    result.push({
      code: room.code,
      players: room.players.size,
      games: gameIds.map((id) => GAMES[id] || GAMES[DEFAULT_GAME]),
      topName: top ? top.name : null,
      topPoints: top ? top.points : 0,
      topRating: top ? rating(top) : 0,
      createdAt: room.createdAt,
    });
  }
  // החדרים העמוסים ביותר קודם
  return result.sort((a, b) => b.players - a.players || b.topRating - a.topRating);
}

/** ניתוק שחקן. מחזיר את החדר ואת השחקן שיצא, לצורך הודעה לשאר. */
export function leaveRoom(socketId) {
  const room = getRoomOf(socketId);
  if (!room) return { room: null, player: null };

  const player = room.players.get(socketId);
  room.players.delete(socketId);
  socketRoom.delete(socketId);

  // חדר ריק נמחק כדי לא להשאיר זיכרון תלוי
  if (room.players.size === 0) rooms.delete(room.code);

  return { room, player };
}
