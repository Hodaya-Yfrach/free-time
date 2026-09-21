// ============================================================================
//  useGameEngine.js — המנוע המשותף לשלושת המשחקים
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

  const [points, setPoints] = useState(initialProgress?.points || 0);
  const [level, setLevel] = useState(initialProgress?.level || 1);
  const [activeMs, setActiveMs] = useState(initialProgress?.activeMs || 0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [countdown, setCountdown] = useState(FAIL_COUNTDOWN_SECONDS);
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
      correctRef.current = 0;
      setCorrectInLevel(0);

      const newLevel = currentLevel + 1;
      levelRef.current = newLevel;
      setLevel(newLevel);
      reportLevelUp(newLevel);

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

  useEffect(() => {
    if (!failed) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [failed]);

  useEffect(() => {
    if (!failed || countdown > 0) return;
    setFailed(false);
    setCountdown(FAIL_COUNTDOWN_SECONDS);
    correctRef.current = 0;
    setCorrectInLevel(0);
    setExternalProgress(0);
    setRoundKey((k) => k + 1);
  }, [failed, countdown]);

  const togglePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    sendPause(next);
  }, [sendPause]);

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
    points,
    level,
    activeMs,
    correctInLevel,
    progressInLevel: levelUpMode === 'external'
      ? externalProgress
      : levelUpMode === 'time'
        ? Math.min(1, (activeMs - levelStartedAtRef.current) / effectiveThreshold)
        : correctInLevel / effectiveThreshold,
    config: levelConfig(level),
    paused,
    failed,
    countdown,
    frozen,
    frozenRef,
    roundKey,
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
    registerSuccess,
    registerFailure,
    togglePause,
  };
}