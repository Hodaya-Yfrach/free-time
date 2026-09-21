// ============================================================================
//  useGameEngine.js — המנוע המשותף לשלושת המשחקים
<<<<<<< HEAD
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
=======
>>>>>>> upgrade-v3
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame, LEVEL_UP_DURATION } from '../state/GameContext.jsx';
<<<<<<< HEAD
import { answerPoints, levelConfig, LEVEL_STEP } from '../shared/scoring.js';
import { saveProgress } from '../storage/progress.js';

/** כמה שניות נמשכת הספירה לאחור אחרי טעות */
const FAIL_COUNTDOWN_SECONDS = 5;

/** כל כמה זמן מדווחים ניקוד לשרת (כדי לא להציף אותו) */
const SYNC_INTERVAL_MS = 1000;

export function useGameEngine({ gameId, initialProgress }) {
  const { session, sendScore, sendPause, reportLevelUp, levelUp } = useGame();
=======
import { answerPoints, levelConfig, questionPoints, LEVEL_STEP } from '../shared/scoring.js';
import { saveProgress } from '../storage/progress.js';
import { pickUnusedRiddle } from '../shared/riddles.js';
import { rollPrizeOptions } from '../shared/prizes.js';
import {
  loadOwnedPrizes, addOwnedPrize,
  loadSkipUsesLeft, consumeSkipUse,
  incrementMedalsCount,
  loadPowerups, addPowerups, removePowerup,
} from '../storage/prizesStorage.js';

const FAIL_COUNTDOWN_SECONDS = 5;
const SYNC_INTERVAL_MS = 1000;
const MEDAL_FAST_ANSWER_MS = 3000;
const MEDAL_CLEAN_STREAK_LEVELS = 3;
const MEDAL_ANSWER_WINDOW_MS = 20000;
const PRIZE_EVERY_N_MEDALS = 3;
const SKIP_PRIZE_LIMIT = 2;
const SHIELD_GRACE_MS = 2000;

export function useGameEngine({ gameId, initialProgress, levelUpMode = 'count', levelUpThreshold }) {
  const { session, sendScore, sendPause, reportLevelUp, levelUp, leaderMedal, pushToast } = useGame();

  const effectiveThreshold = levelUpThreshold ?? LEVEL_STEP;
>>>>>>> upgrade-v3

  const [points, setPoints] = useState(initialProgress?.points || 0);
  const [level, setLevel] = useState(initialProgress?.level || 1);
  const [activeMs, setActiveMs] = useState(initialProgress?.activeMs || 0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [countdown, setCountdown] = useState(FAIL_COUNTDOWN_SECONDS);
<<<<<<< HEAD

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
=======
  const [roundKey, setRoundKey] = useState(0);

  const [medalChallenge, setMedalChallenge] = useState(null);
  const [prizeSelection, setPrizeSelection] = useState(null); 
  const [ownedPrizes, setOwnedPrizes] = useState(() => loadOwnedPrizes());
  const [skipUsesLeft, setSkipUsesLeft] = useState(() => loadSkipUsesLeft(SKIP_PRIZE_LIMIT));
  const [powerups, setPowerups] = useState(() => loadPowerups());
  const [scoreBoost, setScoreBoost] = useState(null);
  const [externalProgress, setExternalProgress] = useState(0);
  const [medalRunCount, setMedalRunCount] = useState(0);
  const [levelStartedAt, setLevelStartedAt] = useState(initialProgress?.activeMs || 0);

  const levelRef = useRef(level);
  const levelStartedAtRef = useRef(initialProgress?.activeMs || 0);
  const configRef = useRef(levelConfig(level));
  const frozenRef = useRef(false);
  const pausedRef = useRef(false);
  const correctRef = useRef(0);   
  const cleanLevelRef = useRef(true);   
  const streakRef = useRef(0);          
  const usedRiddleIdsRef = useRef([]);  
  const medalChallengeRef = useRef(null);
  const prizeSelectionRef = useRef(null);
  const powerupsRef = useRef(powerups);
  const scoreBoostRef = useRef(null);
  const shieldGraceUntilRef = useRef(0);
  const shieldsRef = useRef(0);
  const powerHandlerRef = useRef(null);

  const forThisGame = (p) => p.appliesTo === 'global' || p.appliesTo === gameId;
  const gamePowerups = powerups.filter(forThisGame);
  shieldsRef.current = gamePowerups.filter((p) => p.effect === 'shield').length;

  const levelUpVisible = !!levelUp;
  const frozen = paused || failed || levelUpVisible || !!medalChallenge || !!prizeSelection || !!leaderMedal;

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { configRef.current = levelConfig(level); }, [level]);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);
  useEffect(() => { medalChallengeRef.current = medalChallenge; }, [medalChallenge]);
  useEffect(() => { prizeSelectionRef.current = prizeSelection; }, [prizeSelection]);
  useEffect(() => { levelStartedAtRef.current = levelStartedAt; }, [levelStartedAt]);

>>>>>>> upgrade-v3
  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
<<<<<<< HEAD
      if (!frozenRef.current) setActiveMs((ms) => ms + delta);
=======
      if (!frozenRef.current) {
        setActiveMs((ms) => ms + delta);
        const boost = scoreBoostRef.current;
        if (boost) {
          boost.msLeft -= delta;
          if (boost.msLeft <= 0) {
            scoreBoostRef.current = null;
            setScoreBoost(null);
          } else {
            setScoreBoost({ ...boost });
          }
        }
      }
>>>>>>> upgrade-v3
    }, 200);
    return () => clearInterval(id);
  }, []);

<<<<<<< HEAD
  // ------------------------------------------- שמירה בדפדפן + סנכרון לשרת
=======
  useEffect(() => {
    if (levelUpMode !== 'time') return;
    const elapsed = activeMs - levelStartedAtRef.current;
    if (elapsed >= effectiveThreshold) {
      const nextLevel = levelRef.current + 1;
      levelRef.current = nextLevel;
      setLevel(nextLevel);
      setLevelStartedAt(activeMs);
      levelStartedAtRef.current = activeMs;
      reportLevelUp(nextLevel);
      cleanLevelRef.current = true;
      setTimeout(() => setRoundKey((k) => k + 1), LEVEL_UP_DURATION + 50);
    }
  }, [activeMs, effectiveThreshold, levelUpMode, reportLevelUp]);

>>>>>>> upgrade-v3
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

<<<<<<< HEAD
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
=======
  const triggerMedalChallenge = useCallback(() => {
    if (medalChallengeRef.current || prizeSelectionRef.current) return;
    const riddle = pickUnusedRiddle(usedRiddleIdsRef.current);
    usedRiddleIdsRef.current.push(riddle.id);
    setMedalChallenge({ riddle, deadlineAt: Date.now() + MEDAL_ANSWER_WINDOW_MS, result: null });
  }, []);

  const collectMedal = useCallback(() => {
    setMedalRunCount((current) => {
      const next = current + 1;
      if (next >= 5) {
        setTimeout(() => triggerMedalChallenge(), 120);
        return 0;
      }
      return next;
    });
  }, [triggerMedalChallenge]);

  const registerSuccess = useCallback((bonusRatio = 0, { skipFastCheck = false } = {}) => {
    if (frozenRef.current) return 0;

    const currentLevel = levelRef.current;
    const basePoints = answerPoints(currentLevel, bonusRatio);
    const gained = Math.round(basePoints * (scoreBoostRef.current?.factor || 1));
    setPoints((p) => p + gained);

    const elapsedMs = configRef.current.questionMs * (1 - Math.min(1, Math.max(0, bonusRatio)));
    const fastAnswer = !skipFastCheck && elapsedMs <= MEDAL_FAST_ANSWER_MS;

    const next = correctRef.current + 1;
    let didLevelUp = false;

    const progressStep = levelUpMode === 'points' ? basePoints : 1;
    const newProgress = correctRef.current + progressStep;

    if (levelUpMode === 'time') {
      correctRef.current = newProgress;
      setCorrectInLevel(newProgress);
      return gained;
    }

    if (levelUpMode !== 'external' && newProgress >= effectiveThreshold) {
      didLevelUp = true;
>>>>>>> upgrade-v3
      correctRef.current = 0;
      setCorrectInLevel(0);

      const newLevel = currentLevel + 1;
      levelRef.current = newLevel;
      setLevel(newLevel);
      reportLevelUp(newLevel);

<<<<<<< HEAD
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
=======
      streakRef.current = cleanLevelRef.current ? streakRef.current + 1 : 0;
      cleanLevelRef.current = true; 

      setTimeout(() => setRoundKey((k) => k + 1), LEVEL_UP_DURATION + 50);
    } else if (levelUpMode !== 'external') {
      correctRef.current = newProgress;
      setCorrectInLevel(newProgress);

      if (gameId !== 'car') {
        setRoundKey((k) => k + 1);
      }
    }

    const streakHit = streakRef.current >= MEDAL_CLEAN_STREAK_LEVELS;
    if (streakHit) streakRef.current = 0;

    if (fastAnswer || streakHit) {
      const delay = didLevelUp ? LEVEL_UP_DURATION + 200 : 0;
      setTimeout(triggerMedalChallenge, delay);
    }

    return gained;
  }, [reportLevelUp, triggerMedalChallenge, levelUpMode, effectiveThreshold]);

  const registerFailure = useCallback(({ grace = true } = {}) => {
    if (frozenRef.current) return true;

    const now = performance.now();
    if (grace && now < shieldGraceUntilRef.current) return false;
    const shield = powerupsRef.current.find(
      (p) => p.effect === 'shield' && (p.appliesTo === 'global' || p.appliesTo === gameId)
    );
    if (shield) {
      const rest = removePowerup(shield.uid);
      powerupsRef.current = rest;
      setPowerups(rest);
      if (grace) shieldGraceUntilRef.current = now + SHIELD_GRACE_MS;
      pushToast('🛡️ חומת המגן ספגה את הפגיעה!', 'info');
      return false;
    }

    cleanLevelRef.current = false; 
    setFailed(true);
    setCountdown(FAIL_COUNTDOWN_SECONDS);
    return true;
  }, [gameId, pushToast]);

>>>>>>> upgrade-v3
  useEffect(() => {
    if (!failed) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [failed]);

<<<<<<< HEAD
  // כשהספירה מגיעה לאפס — השלב מתחיל מחדש. הנקודות נשמרות.
=======
>>>>>>> upgrade-v3
  useEffect(() => {
    if (!failed || countdown > 0) return;
    setFailed(false);
    setCountdown(FAIL_COUNTDOWN_SECONDS);
    correctRef.current = 0;
    setCorrectInLevel(0);
<<<<<<< HEAD
    setRoundKey((k) => k + 1);
  }, [failed, countdown]);

  // ------------------------------------------------------------- השהיה
=======
    setExternalProgress(0);
    setRoundKey((k) => k + 1);
  }, [failed, countdown]);

>>>>>>> upgrade-v3
  const togglePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    sendPause(next);
  }, [sendPause]);

<<<<<<< HEAD
  return {
    // מצב
=======
  const forceLevelUp = useCallback(() => {
    const newLevel = levelRef.current + 1;
    correctRef.current = 0;
    setCorrectInLevel(0);
    setExternalProgress(0);
    levelRef.current = newLevel;
    setLevel(newLevel);
    cleanLevelRef.current = true; 
    reportLevelUp(newLevel);
    setTimeout(() => setRoundKey((k) => k + 1), LEVEL_UP_DURATION + 50);
  }, [reportLevelUp]);

  const completeLevel = useCallback(() => {
    if (frozenRef.current) return;

    const newLevel = levelRef.current + 1;
    levelRef.current = newLevel;
    setLevel(newLevel);
    setLevelStartedAt(activeMs);
    levelStartedAtRef.current = activeMs;
    correctRef.current = 0;
    setCorrectInLevel(0);
    setExternalProgress(0);
    reportLevelUp(newLevel);

    streakRef.current = cleanLevelRef.current ? streakRef.current + 1 : 0;
    cleanLevelRef.current = true;
    if (streakRef.current >= MEDAL_CLEAN_STREAK_LEVELS) {
      streakRef.current = 0;
      setTimeout(triggerMedalChallenge, LEVEL_UP_DURATION + 200);
    }

    setTimeout(() => setRoundKey((k) => k + 1), LEVEL_UP_DURATION + 50);
  }, [activeMs, reportLevelUp, triggerMedalChallenge]);

  const refreshRound = useCallback(() => setRoundKey((k) => k + 1), []);

  const submitMedalAnswer = useCallback((index) => {
    const challenge = medalChallengeRef.current;
    if (!challenge || challenge.result) return;

    const inTime = Date.now() <= challenge.deadlineAt;
    const correct = inTime && index === challenge.riddle.correctIndex;
    const result = correct ? 'success' : inTime ? 'wrong' : 'timeout';
    setMedalChallenge({ ...challenge, result });

    if (correct) {
      const total = incrementMedalsCount();
      setTimeout(() => {
        if (total % PRIZE_EVERY_N_MEDALS === 0) {
          setPrizeSelection({ options: rollPrizeOptions({ gameId, level: levelRef.current, count: 3 }) });
        }
        setMedalChallenge(null);
      }, 1800);
    } else {
      setTimeout(() => setMedalChallenge(null), 1800);
    }
  }, [gameId]);

  const choosePrize = useCallback((prize) => {
    if (prize.kind === 'skip') {
      if (skipUsesLeft <= 0) return; 
      consumeSkipUse();
      setSkipUsesLeft((n) => Math.max(0, n - 1));
      setPrizeSelection(null);
      forceLevelUp();
    } else if (prize.kind === 'powerup') {
      const list = addPowerups(prize);
      powerupsRef.current = list;
      setPowerups(list);
      setPrizeSelection(null);
      pushToast(
        prize.trigger === 'auto'
          ? `${prize.icon} הבונוס "${prize.label}" נוסף (יופעל אוטומטית)`
          : `${prize.icon} ${prize.label} נוסף למלאי - לחצי עליו להפעלה`,
        'info'
      );
    } else {
      setOwnedPrizes(addOwnedPrize(prize));
      setPrizeSelection(null);
    }
  }, [skipUsesLeft, forceLevelUp, pushToast]);

  const addBonusPoints = useCallback((amount) => {
    setPoints((p) => p + amount);
    pushToast(`+${amount} נקודות בונוס!`, 'info');
  }, [pushToast]);

  const applyUniversalEffect = useCallback((item) => {
    const params = item.params || {};
    if (item.effect === 'points') {
      addBonusPoints(Math.round(questionPoints(levelRef.current) * params.questions));
      return true;
    }
    if (item.effect === 'treasure') {
      const questions = 4 + Math.floor(Math.random() * 37);
      addBonusPoints(questionPoints(levelRef.current) * questions);
      return true;
    }
    if (item.effect === 'score_boost') {
      scoreBoostRef.current = { factor: params.factor, msLeft: params.seconds * 1000 };
      setScoreBoost({ ...scoreBoostRef.current });
      return true;
    }
    return false;
  }, [addBonusPoints]);

  const activatePowerup = useCallback((uid) => {
    if (frozenRef.current) return;
    const item = powerupsRef.current.find((p) => p.uid === uid && p.trigger !== 'auto');
    if (!item) return;

    const applied = applyUniversalEffect(item) || (powerHandlerRef.current ? powerHandlerRef.current(item) : false);
    if (!applied) {
      pushToast('לא ניתן להשתמש בבונוס הזה כרגע', 'info');
      return;
    }
    const rest = removePowerup(item.uid);
    powerupsRef.current = rest;
    setPowerups(rest);
  }, [applyUniversalEffect, pushToast]);

  return {
>>>>>>> upgrade-v3
    points,
    level,
    activeMs,
    correctInLevel,
<<<<<<< HEAD
    progressInLevel: correctInLevel / LEVEL_STEP,
=======
    progressInLevel: levelUpMode === 'external'
      ? externalProgress
      : levelUpMode === 'time'
        ? Math.min(1, (activeMs - levelStartedAtRef.current) / effectiveThreshold)
        : correctInLevel / effectiveThreshold,
>>>>>>> upgrade-v3
    config: levelConfig(level),
    paused,
    failed,
    countdown,
    frozen,
    frozenRef,
    roundKey,
<<<<<<< HEAD
    // פעולות
=======
    medalChallenge,
    prizeSelection,
    ownedPrizes,
    skipUsesLeft,
    skipPrizeLimit: SKIP_PRIZE_LIMIT,
    medalAnswerWindowMs: MEDAL_ANSWER_WINDOW_MS,
    submitMedalAnswer,
    choosePrize,
    triggerMedalChallenge,
    completeLevel,
    setLevelProgress: setExternalProgress,
    refreshRound,
    powerups: gamePowerups,
    activatePowerup,
    powerHandlerRef,
    scoreBoost,
    shieldsRef,
    shieldGraceUntilRef,
    medalRunCount,
    collectMedal,
>>>>>>> upgrade-v3
    registerSuccess,
    registerFailure,
    togglePause,
  };
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
