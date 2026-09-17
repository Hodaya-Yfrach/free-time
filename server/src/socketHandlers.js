// ============================================================================
//  socketHandlers.js — כל אירועי ה-Socket.IO במקום אחד
//  ----------------------------------------------------------------------
//  חוזה האירועים מול הלקוח:
//
//  לקוח → שרת
//    join-room     { roomCode, name, gameId, restoredProgress }  (עם ack)
//    score-update  { points, level, activeMs }
//    level-up      { level }                                     (עם ack)
//    pause-toggle  { paused }
//    list-rooms    —                                             (עם ack)
//    leave-room    —
//
//  שרת → לקוח
//    leaderboard-update  [players]
//    player-joined       { name }
//    player-left         { name }
//    player-paused       { name, paused }
//    leader-changed      { name }
// ============================================================================

import * as store from './rooms.js';

export function registerHandlers(io) {
  /** שולח לכל שחקן בחדר לוח תוצאות מסונן למשחק שהוא עצמו משחק */
  function broadcastLeaderboard(room) {
    if (!room) return;
    for (const player of room.players.values()) {
      io.to(player.id).emit('leaderboard-update', store.leaderboard(room, player.gameId));
    }
  }

  io.on('connection', (socket) => {
    // ---------------------------------------------------------------- join
    socket.on('join-room', (payload = {}, ack) => {
      // אם השחקן כבר היה בחדר אחר — מוציאים אותו משם קודם
      const previous = store.leaveRoom(socket.id);
      if (previous.room && previous.player) {
        socket.leave(previous.room.code);
        socket.to(previous.room.code).emit('player-left', { name: previous.player.name });
        broadcastLeaderboard(previous.room);
      }

      const { room, player } = store.joinRoom({
        socketId: socket.id,
        roomCode: payload.roomCode,
        name: payload.name,
        gameId: payload.gameId,
        restoredProgress: payload.restoredProgress,
      });

      socket.join(room.code);

      if (typeof ack === 'function') {
        ack({
          ok: true,
          roomCode: room.code,
          me: { id: player.id, name: player.name, gameId: player.gameId },
          leaderboard: store.leaderboard(room, player.gameId),
        });
      }

      socket.to(room.code).emit('player-joined', { name: player.name });
      broadcastLeaderboard(room);
    });

    // -------------------------------------------------------- score update
    socket.on('score-update', (payload = {}) => {
      const player = store.updateScore(socket.id, payload);
      if (!player) return;

      const room = store.getRoomOf(socket.id);
      if (!room) return;

      const list = store.sortedPlayers(room, player.gameId);
      const newLeader = list[0];

      // הודעת "מוביל חדש" נשלחת רק כשהמוביל באמת התחלף
      if (newLeader && newLeader.points > 0 && room.leaderId !== newLeader.id) {
        room.leaderId = newLeader.id;
        io.to(room.code).emit('leader-changed', { name: newLeader.name });
      }

      broadcastLeaderboard(room);
    });

    // ------------------------------------------------------------ level up
    socket.on('level-up', (payload = {}, ack) => {
      store.updateScore(socket.id, { level: Number(payload.level) });
      const summary = store.levelUpSummary(socket.id);
      if (typeof ack === 'function') ack(summary);
      broadcastLeaderboard(store.getRoomOf(socket.id));
    });

    // --------------------------------------------------------------- pause
    socket.on('pause-toggle', (payload = {}) => {
      const player = store.setPaused(socket.id, payload.paused);
      const room = store.getRoomOf(socket.id);
      if (!player || !room) return;

      socket.to(room.code).emit('player-paused', { name: player.name, paused: player.paused });
      broadcastLeaderboard(room);
    });

    // --------------------------------------------------- רשימת חדרים פעילים
    socket.on('list-rooms', (_payload, ack) => {
      if (typeof ack === 'function') ack(store.listActiveRooms());
    });

    // ------------------------------------------------------- יציאה / ניתוק
    function handleLeave() {
      const { room, player } = store.leaveRoom(socket.id);
      if (!room || !player) return;
      socket.to(room.code).emit('player-left', { name: player.name });
      broadcastLeaderboard(room);
    }

    socket.on('leave-room', handleLeave);
    socket.on('disconnect', handleLeave);
  });
}
