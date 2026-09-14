const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

function getSortedPlayers(roomCode) {
  const room = rooms[roomCode];
  if (!room) return [];
  return Object.values(room.players).sort((a, b) => b.score - a.score);
}

function broadcastLeaderboard(roomCode) {
  const sorted = getSortedPlayers(roomCode);
  io.to(roomCode).emit('leaderboard-update', sorted);
}

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomCode, name }) => {
    roomCode = (roomCode || 'default').trim().toUpperCase();
    name = (name || 'שחקן').trim().slice(0, 20);

    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: {}, leaderId: null };
    }

    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.name = name;

    rooms[roomCode].players[socket.id] = {
      id: socket.id,
      name,
      score: 0,
      level: 1,
      paused: false
    };

    socket.emit('room-joined', {
      roomCode,
      players: getSortedPlayers(roomCode)
    });

    socket.to(roomCode).emit('player-joined', { name });
    broadcastLeaderboard(roomCode);
  });

  socket.on('score-update', ({ score, level }) => {
    const roomCode = socket.data.roomCode;
    if (!roomCode || !rooms[roomCode] || !rooms[roomCode].players[socket.id]) return;

    const room = rooms[roomCode];
    const player = room.players[socket.id];

    if (typeof score === 'number' && score >= player.score) {
      player.score = score;
    }
    if (typeof level === 'number' && level > player.level) {
      io.to(roomCode).emit('level-up', { name: player.name, level });
      player.level = level;
    }

    const sorted = getSortedPlayers(roomCode);
    const newLeader = sorted.length ? sorted[0] : null;

    if (newLeader && newLeader.score > 0 && newLeader.id !== room.leaderId) {
      room.leaderId = newLeader.id;
      io.to(roomCode).emit('leader-changed', { name: newLeader.name });
    }

    broadcastLeaderboard(roomCode);
  });

  socket.on('pause-toggle', ({ paused }) => {
    const roomCode = socket.data.roomCode;
    if (!roomCode || !rooms[roomCode] || !rooms[roomCode].players[socket.id]) return;

    rooms[roomCode].players[socket.id].paused = !!paused;
    io.to(roomCode).emit('player-paused', {
      name: rooms[roomCode].players[socket.id].name,
      paused: !!paused
    });
    broadcastLeaderboard(roomCode);
  });

  socket.on('disconnect', () => {
    const roomCode = socket.data.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const player = rooms[roomCode].players[socket.id];
    delete rooms[roomCode].players[socket.id];

    if (player) {
      socket.to(roomCode).emit('player-left', { name: player.name });
    }

    if (Object.keys(rooms[roomCode].players).length === 0) {
      delete rooms[roomCode];
    } else {
      broadcastLeaderboard(roomCode);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`קרב המדליה רץ על http://localhost:${PORT}`);
});
