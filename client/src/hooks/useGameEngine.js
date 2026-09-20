// ============================================================================
//  useGameEngine.js — המנוע המשותף לשלושת המשחקים
//  ----------------------------------------------------------------------
//  כל משחק אחראי רק על מה שקורה על המסך שלו (צורות / מכונית / דולר).
//  כל מה שמשותף נמצא כאן:
//    • ניקוד לפי שלב + בונוס מהירות
//    • ספירת זמן משחק פעיל (לא נספר בזמן השהיה או מסך כישלון)
//    • עלייה בשלב אחרי סף מסוים (ר' levelUpMode/levelUpThreshold למטה)
//    • טיפול בכישלון: מסך אדום, ספירה לאחור, התחלת השלב מחדש
//    • שמירה בדפדפן ודיווח לשרת
//
//  המשחק מקבל מהמנוע כמה פעולות:
//    registerSuccess(bonusRatio, opts?) — הצלחה (תשובה נכונה / מכשול שנעקף / מטבע).
//                                          opts.skipFastCheck=true מדלג על בדיקת
//                                          "ענית תוך 3 שניות" (למשחקים שבהם זה
//                                          תמיד קורה ולא אומר כלום על מיומנות).
//    registerFailure()                  — טעות / התנגשות (מחזיר false אם מגן ספג אותה)
//    triggerMedalChallenge()            — מפעיל אתגר מדליה בתנאי הצלחה מותאם-אישית
//
//  פרמטרים אופציונליים ל-useGameEngine:
//    levelUpMode: 'count' (ברירת מחדל, LEVEL_STEP הצלחות = שלב) |
//                 'points' (ניקוד מצטבר בתוך השלב = שלב, ר' levelUpThreshold) |
//                 'external' (המשחק עצמו מחליט מתי עוברים שלב וקורא ל-completeLevel)
//    levelUpThreshold: הסף בפועל (מספר הצלחות או ניקוד, לפי levelUpMode)
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame, LEVEL_UP_DURATION } from '../state/GameContext.jsx';
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

/** כמה שניות נמשכת הספירה לאחור אחרי טעות */
const FAIL_COUNTDOWN_SECONDS = 5;

/** כל כמה זמן מדווחים ניקוד לשרת (כדי לא להציף אותו) */
const SYNC_INTERVAL_MS = 1000;

// ---- הגדרות "מסך המדליה" ----
/** תשובה תוך כמה זמן נחשבת "מהירה" ומפעילה אתגר מדליה מיד */
const MEDAL_FAST_ANSWER_MS = 3000;
/** כמה שלבים "נקיים" (בלי אף טעות) ברצף נדרשים כדי להפעיל אתגר מדליה */
const MEDAL_CLEAN_STREAK_LEVELS = 3;
/** כמה זמן יש לענות על חידת המדליה */
const MEDAL_ANSWER_WINDOW_MS = 20000;
/** כל כמה מדליות נפתחת בחירת פרס */
const PRIZE_EVERY_N_MEDALS = 3;
/** כמה פעמים מותר לממש את פרס "דילוג לשלב" לכל משתמש (כל הדפדפן) */
const SKIP_PRIZE_LIMIT = 2;
/** כמה זמן אחרי שמגן סופג טעות אי אפשר להיפגע שוב (כדי שהתנגשות לא תבזבז את כל המגנים בפריים אחד) */
const SHIELD_GRACE_MS = 2000;

export function useGameEngine({ gameId, initialProgress, levelUpMode = 'count', levelUpThreshold }) {
  const { session, sendScore, sendPause, reportLevelUp, levelUp, pushToast } = useGame();

  // סף עליית השלב בפועל: או ספירת הצלחות (LEVEL_STEP, ברירת המחדל -
  // מתאים לצורות/מכונית), או ניקוד מצטבר בתוך השלב (levelUpMode='points',
  // למשל 20 נקודות במשחק הדולר - ר' GameScreen.jsx).
  const effectiveThreshold = levelUpThreshold ?? LEVEL_STEP;

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

  // ---- מצב "מסך המדליה" וחנות הפרסים ----
  const [medalChallenge, setMedalChallenge] = useState(null); // { riddle, deadlineAt, result }
  const [prizeSelection, setPrizeSelection] = useState(null); // { options }
  const [ownedPrizes, setOwnedPrizes] = useState(() => loadOwnedPrizes());
  const [skipUsesLeft, setSkipUsesLeft] = useState(() => loadSkipUsesLeft(SKIP_PRIZE_LIMIT));
  const [powerups, setPowerups] = useState(() => loadPowerups());
  const [scoreBoost, setScoreBoost] = useState(null); // { factor, msLeft }
  const [externalProgress, setExternalProgress] = useState(0);

  // refs — כדי שלולאות אנימציה יוכלו לקרוא ערכים עדכניים בלי להירנדר מחדש
  const levelRef = useRef(level);
  const configRef = useRef(levelConfig(level));
  const frozenRef = useRef(false);
  const pausedRef = useRef(false);
  const correctRef = useRef(0);   // מונה ההצלחות בשלב הנוכחי
  const cleanLevelRef = useRef(true);   // האם השלב הנוכחי עבר עד כה בלי אף טעות
  const streakRef = useRef(0);          // כמה שלבים "נקיים" ברצף כבר נצברו
  const usedRiddleIdsRef = useRef([]);  // אילו חידות כבר נשאלו בסבב הזה
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
  // "קפוא" = לא סופרים זמן, לא מקבלים קלט, האנימציות עוצרות.
  // גם אתגר מדליה וגם מסך בחירת פרס קופאים את המשחק בדיוק כמו השהיה.
  const frozen = paused || failed || levelUpVisible || !!medalChallenge || !!prizeSelection;

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { configRef.current = levelConfig(level); }, [level]);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);
  useEffect(() => { medalChallengeRef.current = medalChallenge; }, [medalChallenge]);
  useEffect(() => { prizeSelectionRef.current = prizeSelection; }, [prizeSelection]);

  // ------------------------------------------------------ שעון זמן פעיל
  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
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
   * פותח את אתגר המדליה: בוחר חידה שעדיין לא נשאלה בסבב הזה ופותח 20
   * שניות למענה. לא פותחים אתגר נוסף אם כבר יש אחד פעיל, או בזמן
   * שמסך בחירת פרס פתוח.
   */
  const triggerMedalChallenge = useCallback(() => {
    if (medalChallengeRef.current || prizeSelectionRef.current) return;
    const riddle = pickUnusedRiddle(usedRiddleIdsRef.current);
    usedRiddleIdsRef.current.push(riddle.id);
    setMedalChallenge({ riddle, deadlineAt: Date.now() + MEDAL_ANSWER_WINDOW_MS, result: null });
  }, []);

  // ------------------------------------------------------------- הצלחה
  /**
   * @param {number} bonusRatio ערך בין 0 ל-1 — כמה מהר הגיעה ההצלחה.
   *                            1 = מיידי, 0 = בשנייה האחרונה.
   *
   * הערה על המימוש: הספירה מנוהלת ב-ref ולא רק ב-state, כי אסור
   * לבצע תופעות לוואי (דיווח לשרת, טיימרים) בתוך פונקציית עדכון state —
   * React מריץ אותה פעמיים במצב פיתוח, וזה היה גורם לדיווח כפול.
   */
  const registerSuccess = useCallback((bonusRatio = 0, { skipFastCheck = false } = {}) => {
    if (frozenRef.current) return 0;

    const currentLevel = levelRef.current;
    const basePoints = answerPoints(currentLevel, bonusRatio);
    const gained = Math.round(basePoints * (scoreBoostRef.current?.factor || 1));
    setPoints((p) => p + gained);

    // "ענית תוך 3 שניות" — קירוב לפי יחס המהירות וזמן השאלה של השלב
    // הנוכחי (מדויק לגמרי במשחק הצורות). skipFastCheck=true משמש למשחקים
    // שבהם ה"תשובה" היא כמעט תמיד מהירה (למשל תפיסת מטבע בודד במשחק
    // הדולר) - שם הטריגר הזה כמעט תמיד היה נדלק ולא אומר כלום על מיומנות,
    // אז המשחק מפעיל טריגר מדליה משלו (ר' DollarGame.jsx) במקום זה.
    const elapsedMs = configRef.current.questionMs * (1 - Math.min(1, Math.max(0, bonusRatio)));
    const fastAnswer = !skipFastCheck && elapsedMs <= MEDAL_FAST_ANSWER_MS;

    const next = correctRef.current + 1;
    let didLevelUp = false;

    // התקדמות בתוך השלב: בברירת המחדל סופרים הצלחות (LEVEL_STEP הצלחות
    // = עליית שלב). ב-levelUpMode='points' סופרים ניקוד מצטבר בתוך השלב
    // במקום זה - כי כמות הנקודות שכל הצלחה שווה משתנה משלב לשלב, אז
    // "5 הצלחות" לא שווה דבר קבוע, ואילו "20 נקודות" כן.
    const progressStep = levelUpMode === 'points' ? basePoints : 1;
    const newProgress = correctRef.current + progressStep;

    if (levelUpMode !== 'external' && newProgress >= effectiveThreshold) {
      // עליית שלב
      didLevelUp = true;
      correctRef.current = 0;
      setCorrectInLevel(0);

      const newLevel = currentLevel + 1;
      levelRef.current = newLevel;
      setLevel(newLevel);
      reportLevelUp(newLevel);

      // "3 שלבים בלי אף טעות" — נספר רק אם השלב שהסתיים עכשיו היה נקי לגמרי
      streakRef.current = cleanLevelRef.current ? streakRef.current + 1 : 0;
      cleanLevelRef.current = true; // השלב החדש מתחיל "נקי" עד שתהיה בו טעות

      // הסיבוב הבא מתחיל רק אחרי שמסך הקונפטי נעלם
      setTimeout(() => setRoundKey((k) => k + 1), LEVEL_UP_DURATION + 50);
    } else if (levelUpMode !== 'external') {
      correctRef.current = newProgress;
      setCorrectInLevel(newProgress);
      setRoundKey((k) => k + 1);
    }

    const streakHit = streakRef.current >= MEDAL_CLEAN_STREAK_LEVELS;
    if (streakHit) streakRef.current = 0;

    if (fastAnswer || streakHit) {
      // אם בדיוק עלינו שלב - נותנים לקונפטי של עליית השלב להיעלם קודם
      const delay = didLevelUp ? LEVEL_UP_DURATION + 200 : 0;
      setTimeout(triggerMedalChallenge, delay);
    }

    return gained;
  }, [reportLevelUp, triggerMedalChallenge, levelUpMode, effectiveThreshold]);

  // ------------------------------------------------------------- כישלון
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
      pushToast('🛡️ המגן ספג את הטעות!', 'info');
      return false;
    }

    cleanLevelRef.current = false; // השלב הנוכחי כבר לא "נקי" - מאפס את רצף המדליה
    setFailed(true);
    setCountdown(FAIL_COUNTDOWN_SECONDS);
    return true;
  }, [gameId, pushToast]);

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
    setExternalProgress(0);
    setRoundKey((k) => k + 1);
  }, [failed, countdown]);

  // ------------------------------------------------------------- השהיה
  const togglePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    sendPause(next);
  }, [sendPause]);

  // -------------------------------------------------- דילוג לשלב (פרס)
  /** עליית שלב "בכוח", בלי לעבור דרך תשובות נכונות - זה מה שפרס הדילוג עושה */
  const forceLevelUp = useCallback(() => {
    const newLevel = levelRef.current + 1;
    correctRef.current = 0;
    setCorrectInLevel(0);
    setExternalProgress(0);
    levelRef.current = newLevel;
    setLevel(newLevel);
    cleanLevelRef.current = true; // מתחילים שלב חדש "נקי" - הדילוג עצמו לא נחשב טעות
    reportLevelUp(newLevel);
    setTimeout(() => setRoundKey((k) => k + 1), LEVEL_UP_DURATION + 50);
  }, [reportLevelUp]);

  // ---------------------------------------- עליית שלב שהמשחק מחליט עליה
  const completeLevel = useCallback(() => {
    if (frozenRef.current) return;

    const newLevel = levelRef.current + 1;
    levelRef.current = newLevel;
    setLevel(newLevel);
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
  }, [reportLevelUp, triggerMedalChallenge]);

  const refreshRound = useCallback(() => setRoundKey((k) => k + 1), []);

  // -------------------------------------------------- מענה לחידת המדליה
  /** index = האפשרות שנבחרה, או -1 אם הזמן נגמר בלי מענה */
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

  // -------------------------------------------------------- בחירת פרס
  const choosePrize = useCallback((prize) => {
    if (prize.kind === 'skip') {
      if (skipUsesLeft <= 0) return; // הגנה כפולה - ה-UI כבר מונע לחיצה כשאין שימושים
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
          ? `${prize.icon} ${prize.label} נוסף ויופעל מעצמו`
          : `${prize.icon} ${prize.label} נוסף לתיק הפרסים - לחצי עליו להפעלה`,
        'info'
      );
    } else {
      setOwnedPrizes(addOwnedPrize(prize));
      setPrizeSelection(null);
    }
  }, [skipUsesLeft, forceLevelUp, pushToast]);

  // ------------------------------------------------------- שימוש בכוח-על
  const addBonusPoints = useCallback((amount) => {
    setPoints((p) => p + amount);
    pushToast(`+${amount} נקודות!`, 'info');
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

  /** מפעיל כוח-על מהתיק לפי uid. אם המשחק לא יכול להשתמש בו עכשיו - הוא נשאר בתיק. */
  const activatePowerup = useCallback((uid) => {
    if (frozenRef.current) return;
    const item = powerupsRef.current.find((p) => p.uid === uid && p.trigger !== 'auto');
    if (!item) return;

    const applied = applyUniversalEffect(item) || (powerHandlerRef.current ? powerHandlerRef.current(item) : false);
    if (!applied) {
      pushToast('אי אפשר להשתמש בפרס הזה כרגע', 'info');
      return;
    }
    const rest = removePowerup(item.uid);
    powerupsRef.current = rest;
    setPowerups(rest);
  }, [applyUniversalEffect, pushToast]);

  return {
    // מצב
    points,
    level,
    activeMs,
    correctInLevel,
    progressInLevel: levelUpMode === 'external' ? externalProgress : correctInLevel / effectiveThreshold,
    config: levelConfig(level),
    paused,
    failed,
    countdown,
    frozen,
    frozenRef,
    roundKey,
    // מדליה ופרסים
    medalChallenge,
    prizeSelection,
    ownedPrizes,
    skipUsesLeft,
    skipPrizeLimit: SKIP_PRIZE_LIMIT,
    medalAnswerWindowMs: MEDAL_ANSWER_WINDOW_MS,
    submitMedalAnswer,
    choosePrize,
    // מאפשר למשחק (כמו DollarGame) להפעיל אתגר מדליה בתנאי הצלחה משלו
    triggerMedalChallenge,
    // עליית שלב לפי כלל של המשחק עצמו (levelUpMode='external') והתקדמות בשלב (0..1)
    completeLevel,
    setLevelProgress: setExternalProgress,
    refreshRound,
    // כוחות-על: התיק של המשחק הנוכחי, הפעלה, וחיבור ההשפעה מצד המשחק
    powerups: gamePowerups,
    activatePowerup,
    powerHandlerRef,
    scoreBoost,
    shieldsRef,
    shieldGraceUntilRef,
    // פעולות
    registerSuccess,
    registerFailure,
    togglePause,
  };
}
