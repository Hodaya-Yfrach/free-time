// ============================================================================
<<<<<<< HEAD
//  GameContext.jsx — המקור היחיד לאמת על מצב החדר
//  ----------------------------------------------------------------------
//  אחראי על:
//    • החיבור לשרת וכל ההאזנות לאירועים
//    • מי אני, באיזה חדר אני ואיזה משחק בחרתי
//    • לוח התוצאות המשותף
//    • ההודעות הצצות (toasts)
//    • מסך עליית השלב עם הקונפטי
//
//  הרכיבים לא מדברים עם ה-socket ישירות — הם קוראים ל-useGame().
=======
//  GameContext.jsx — ניהול הסטייט, החיבור וההודעות המרחפות
>>>>>>> upgrade-v3
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socket, request } from '../net/socket.js';

const GameContext = createContext(null);

<<<<<<< HEAD
/** משך התצוגה של מסך עליית השלב, במילישניות (2 שניות לפי הדרישה) */
=======
>>>>>>> upgrade-v3
export const LEVEL_UP_DURATION = 2000;

let toastId = 0;

export function GameProvider({ children }) {
<<<<<<< HEAD
  /** session = { roomCode, name, gameId } — null כל עוד לא הצטרפנו */
  const [session, setSession] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [levelUp, setLevelUp] = useState(null); // סיכום עליית שלב או null
  const [connected, setConnected] = useState(socket.connected);

  const levelUpTimer = useRef(null);
=======
  const [session, setSession] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [levelUp, setLevelUp] = useState(null); 
  const [leaderMedal, setLeaderMedal] = useState(null); 
  const [connected, setConnected] = useState(socket.connected);

  const levelUpTimer = useRef(null);
  const leaderMedalTimer = useRef(null);
>>>>>>> upgrade-v3

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
<<<<<<< HEAD
    const onJoined = ({ name }) => pushToast(`${name} הצטרפה למשחק`, 'info');
    const onLeft = ({ name }) => pushToast(`${name} יצאה מהמשחק`, 'info');
    const onPaused = ({ name, paused }) =>
      pushToast(`${name} ${paused ? 'בהשהיה' : 'חזרה למשחק'}`, 'info');
    const onLeader = ({ name }) => pushToast(`👑 ${name} מובילה עכשיו`, 'leader');
=======
    
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
>>>>>>> upgrade-v3

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
<<<<<<< HEAD
  /**
   * @param {object} opts
   * @param {string} opts.roomCode  קוד החדר
   * @param {string} opts.name      שם השחקנית
   * @param {string} opts.gameId    המשחק שנבחר
   * @param {object|null} opts.restoredProgress  התקדמות שמורה להמשך, או null להתחלה מאפס
   */
=======
>>>>>>> upgrade-v3
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

<<<<<<< HEAD
  /**
   * מדווח לשרת על עליית שלב ומקבל בחזרה את סיכום העקיפות.
   * השרת הוא זה שמחשב את "את מי עקפת" כי רק לו יש את התמונה המלאה.
   */
=======
>>>>>>> upgrade-v3
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
<<<<<<< HEAD
=======
    leaderMedal,
>>>>>>> upgrade-v3
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

<<<<<<< HEAD
/** ה-hook שכל הרכיבים משתמשים בו כדי לגשת למצב המשחק */
=======
>>>>>>> upgrade-v3
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame חייב לרוץ בתוך GameProvider');
  return ctx;
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
