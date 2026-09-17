// ============================================================================
//  useGameEngine.js — המנוע המשותף לשלושת המשחקים
//  ----------------------------------------------------------------------
//  כל משחק אחראי רק על מה שקורה על המסך שלו (צורות / מכונית / דולר).
//  כל מה שמשותף נמצא כאן:
//    • ניקוד לפי שלב + בונוס מהירות
//    • ספירת זמן משחק פעיל (לא נספר בזמן השהיה או מסך כישלון)
//    • עלייה בשלב אחרי LEVEL_STEP תשובות נכונות
//    • טיפול בכישלון: מסך אדום, ספירה לאחור, התחלת השלב מחדש
//    • שמירה בדפדפן ודיווח לשרת
//
//  המשחק מקבל מהמנוע שתי פעולות בלבד:
//    registerSuccess(bonusRatio)  — הצלחה (תשובה נכונה / מכשול שנעקף / מטבע)
//    registerFailure()            — טעות / התנגשות
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame, LEVEL_UP_DURATION } from '../state/GameContext.jsx';
import { answerPoints, levelConfig, LEVEL_STEP } from '../shared/scoring.js';
import { saveProgress } from '../storage/progress.js';

/** כמה שניות נמשכת הספירה לאחור אחרי טעות */
const FAIL_COUNTDOWN_SECONDS = 5;

/** כל כמה זמן מדווחים ניקוד לשרת (כדי לא להציף אותו) */
const SYNC_INTERVAL_MS = 1000;

export function useGameEngine({ gameId, initialProgress }) {
  const { session, sendScore, sendPause, reportLevelUp, levelUp } = useGame();

  const [points, setPoints] = useState(initialProgress?.points || 0);
  const [level, setLevel] = useState(initialProgress?.level || 1);
  const [activeMs, setActiveMs] = useState(initialProgress?.activeMs || 0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [countdown, setCountdown] = useState(FAIL_COUNTDOWN_SECONDS);

  /**
   * roundKey עולה ב-1 בכל פעם שצריך להתחיל סיבוב מחדש
   * (אחרי טעות או אחרי עליית שלב). המשחקים מאזינים לו
   * ב-useEffect ובונים מצב חדש.
   */
  const [roundKey, setRoundKey] = useState(0);

  // refs — כדי שלולאות אנימציה יוכלו לקרוא ערכים עדכניים בלי להירנדר מחדש
  const levelRef = useRef(level);
  const frozenRef = useRef(false);
  const pausedRef = useRef(false);
  const correctRef = useRef(0);   // מונה ההצלחות בשלב הנוכחי

  const levelUpVisible = !!levelUp;
  // "קפוא" = לא סופרים זמן, לא מקבלים קלט, האנימציות עוצרות
  const frozen = paused || failed || levelUpVisible;

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);

  // ------------------------------------------------------ שעון זמן פעיל
  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      if (!frozenRef.current) setActiveMs((ms) => ms + delta);
    }, 200);
    return () => clearInterval(id);
  }, []);

  // ------------------------------------------- שמירה בדפדפן + סנכרון לשרת
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => {
      const snapshot = {
        roomCode: session.roomCode,
        name: session.name,
        points,
        level,
        activeMs: Math.round(activeMs),
      };
      saveProgress(gameId, snapshot);
      sendScore({ points, level, activeMs: Math.round(activeMs) });
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [session, gameId, points, level, activeMs, sendScore]);

  // ------------------------------------------------------------- הצלחה
  /**
   * @param {number} bonusRatio ערך בין 0 ל-1 — כמה מהר הגיעה ההצלחה.
   *                            1 = מיידי, 0 = בשנייה האחרונה.
   *
   * הערה על המימוש: הספירה מנוהלת ב-ref ולא רק ב-state, כי אסור
   * לבצע תופעות לוואי (דיווח לשרת, טיימרים) בתוך פונקציית עדכון state —
   * React מריץ אותה פעמיים במצב פיתוח, וזה היה גורם לדיווח כפול.
   */
  const registerSuccess = useCallback((bonusRatio = 0) => {
    if (frozenRef.current) return 0;

    const currentLevel = levelRef.current;
    const gained = answerPoints(currentLevel, bonusRatio);
    setPoints((p) => p + gained);

    const next = correctRef.current + 1;

    if (next >= LEVEL_STEP) {
      // עליית שלב
      correctRef.current = 0;
      setCorrectInLevel(0);

      const newLevel = currentLevel + 1;
      levelRef.current = newLevel;
      setLevel(newLevel);
      reportLevelUp(newLevel);

      // הסיבוב הבא מתחיל רק אחרי שמסך הקונפטי נעלם
      setTimeout(() => setRoundKey((k) => k + 1), LEVEL_UP_DURATION + 50);
    } else {
      correctRef.current = next;
      setCorrectInLevel(next);
      setRoundKey((k) => k + 1);
    }

    return gained;
  }, [reportLevelUp]);

  // ------------------------------------------------------------- כישלון
  const registerFailure = useCallback(() => {
    if (frozenRef.current) return;
    setFailed(true);
    setCountdown(FAIL_COUNTDOWN_SECONDS);
  }, []);

  // ספירה לאחור במסך הכישלון
  useEffect(() => {
    if (!failed) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [failed]);

  // כשהספירה מגיעה לאפס — השלב מתחיל מחדש. הנקודות נשמרות.
  useEffect(() => {
    if (!failed || countdown > 0) return;
    setFailed(false);
    setCountdown(FAIL_COUNTDOWN_SECONDS);
    correctRef.current = 0;
    setCorrectInLevel(0);
    setRoundKey((k) => k + 1);
  }, [failed, countdown]);

  // ------------------------------------------------------------- השהיה
  const togglePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    sendPause(next);
  }, [sendPause]);

  return {
    // מצב
    points,
    level,
    activeMs,
    correctInLevel,
    progressInLevel: correctInLevel / LEVEL_STEP,
    config: levelConfig(level),
    paused,
    failed,
    countdown,
    frozen,
    frozenRef,
    roundKey,
    // פעולות
    registerSuccess,
    registerFailure,
    togglePause,
  };
}
