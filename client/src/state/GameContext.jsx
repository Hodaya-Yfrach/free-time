// ============================================================================
//  GameContext.jsx — ניהול הסטייט, החיבור וההודעות המרחפות
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socket, request } from '../net/socket.js';

const GameContext = createContext(null);

export const LEVEL_UP_DURATION = 2000;

let toastId = 0;

export function GameProvider({ children }) {
  const [session, setSession] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [levelUp, setLevelUp] = useState(null); 
  const [leaderMedal, setLeaderMedal] = useState(null); 
  const [connected, setConnected] = useState(socket.connected);

  const levelUpTimer = useRef(null);
  const leaderMedalTimer = useRef(null);

  // ------------------------------------------------------------- הודעות צצות
  const pushToast = useCallback((text, kind = 'info') => {
    const id = ++toastId;
    setToasts((list) => [...list, { id, text, kind }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // ------------------------------------------------- האזנה לאירועים מהשרת
  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onLeaderboard = (list) => setLeaderboard(list || []);
    
    // שדרוג הטקסטים של ההודעות הקופצות לאווירת פרימיום/תחרות
    const onJoined = ({ name }) => pushToast(`${name} נכנסה לזירה!`, 'info');
    const onLeft = ({ name }) => pushToast(`${name} עזבה את הזירה`, 'info');
    const onPaused = ({ name, paused }) =>
      pushToast(`${name} ${paused ? 'עצרה להתרענן' : 'חזרה לעניינים!'}`, 'info');
    
    const onLeader = ({ name }) => {
      pushToast(`👑 ${name} לקחה את ההובלה!`, 'leader');
      setLeaderMedal({ name });
      clearTimeout(leaderMedalTimer.current);
      leaderMedalTimer.current = setTimeout(() => setLeaderMedal(null), 5000);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('leaderboard-update', onLeaderboard);
    socket.on('player-joined', onJoined);
    socket.on('player-left', onLeft);
    socket.on('player-paused', onPaused);
    socket.on('leader-changed', onLeader);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('leaderboard-update', onLeaderboard);
      socket.off('player-joined', onJoined);
      socket.off('player-left', onLeft);
      socket.off('player-paused', onPaused);
      socket.off('leader-changed', onLeader);
    };
  }, [pushToast]);

  // ------------------------------------------------------------- הצטרפות
  const joinRoom = useCallback(async ({ roomCode, name, gameId, restoredProgress }) => {
    const response = await request('join-room', { roomCode, name, gameId, restoredProgress });
    if (!response?.ok) return null;

    setLeaderboard(response.leaderboard || []);
    setSession({ roomCode: response.roomCode, name: response.me.name, gameId });
    return response;
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit('leave-room');
    setSession(null);
    setLeaderboard([]);
    setLevelUp(null);
  }, []);

  // ------------------------------------------------- דיווחים שוטפים לשרת
  const sendScore = useCallback((payload) => {
    socket.emit('score-update', payload);
  }, []);

  const sendPause = useCallback((paused) => {
    socket.emit('pause-toggle', { paused });
  }, []);

  const reportLevelUp = useCallback(async (level) => {
    const summary = await request('level-up', { level });
    if (!summary) return;

    setLevelUp(summary);
    clearTimeout(levelUpTimer.current);
    levelUpTimer.current = setTimeout(() => setLevelUp(null), LEVEL_UP_DURATION);
  }, []);

  const fetchRooms = useCallback(() => request('list-rooms', {}), []);

  const value = {
    session,
    connected,
    leaderboard,
    toasts,
    levelUp,
    leaderMedal,
    joinRoom,
    leaveRoom,
    sendScore,
    sendPause,
    reportLevelUp,
    fetchRooms,
    pushToast,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame חייב לרוץ בתוך GameProvider');
  return ctx;
}