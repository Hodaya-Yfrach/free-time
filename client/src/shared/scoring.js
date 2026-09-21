// ============================================================================
//  scoring.js — מנוע הניקוד המשותף לכל המשחקים
//  ----------------------------------------------------------------------
//  הקובץ משוכפל בין צד הלקוח לצד השרת כדי להבטיח סנכרון מושלם
//  בחישוב הניקוד, המהירות והדירוג הסופי בלוח התוצאות.
// ============================================================================

export const POINTS_STEP = 2;

export const LEVEL_STEP = 5;

export const SPEED_WEIGHT = 5;

export const MAX_OBJECTS_ON_SCREEN = 12;

export function questionPoints(level) {
  return Math.max(1, level) * POINTS_STEP;
}

export function speedBonus(level, ratio) {
  const r = Math.min(1, Math.max(0, ratio || 0));
  return Math.round(questionPoints(level) * r);
}

export function answerPoints(level, ratio) {
  return questionPoints(level) + speedBonus(level, ratio);
}

export function rating(player) {
  const points = player.points || 0;
  const minutes = Math.max(player.activeMs || 0, 5000) / 60000;
  const pointsPerMinute = points / minutes;
  return Math.round(points + pointsPerMinute * SPEED_WEIGHT);
}

export function comparePlayers(a, b) {
  const byRating = rating(b) - rating(a);
  if (byRating !== 0) return byRating;
  const byPoints = (b.points || 0) - (a.points || 0);
  if (byPoints !== 0) return byPoints;
  return (a.activeMs || 0) - (b.activeMs || 0);
}

export function levelConfig(level) {
  const l = Math.max(1, level);
  return {
    level: l,
    objectsOnScreen: Math.min(3 + l, MAX_OBJECTS_ON_SCREEN),
    questionMs: Math.max(12000, 16000 - (l - 1) * 700),
    speedFactor: Math.min(1 + (l - 1) * 0.08, 2.1),

    lanes: carLanesForLevel(l),
    blockedLanes: carBlockedLanesForLevel(l),

    hazards: Math.min(1 + Math.floor((l - 1) / 2), 10),
  };
}

export function carLanesForLevel(level) {
  if (level >= 100) return 8;
  if (level >= 40) return 6;
  if (level >= 3) return 4;
  return 2;
}

export function carBlockedLanesForLevel(level) {
  if (level >= 100) return 4;
  if (level >= 40) return 3;
  if (level >= 25) return 3;
  if (level >= 10) return 2;
  return 1;
}

export function carSpeedFactor(level) {
  const l = Math.max(1, level);
  return Math.min(1 + (l - 1) * 0.045, 3);
}