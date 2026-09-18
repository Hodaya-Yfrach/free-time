// ============================================================================
//  scoring.js — מנוע הניקוד המשותף לכל המשחקים
//  ----------------------------------------------------------------------
//  הקובץ הזה זהה לחלוטין ל-server/src/scoring.js.
//  הסיבה: השרת חייב לדעת לדרג את השחקנים בדיוק באותו אופן שבו
//  הלקוח מחשב את הנקודות, אחרת יתקבלו שתי "אמיתות" שונות.
//  אם משנים כאן — מעתיקים את הקובץ גם לצד השרת.
// ============================================================================

/** כמה נקודות נוספות שווה כל שלב. שלב 1 = 2 נק', שלב 2 = 4 נק', שלב 3 = 6... */
export const POINTS_STEP = 2;

/** כמה תשובות נכונות צריך כדי לעלות שלב */
export const LEVEL_STEP = 5;

/** משקל מהירות המשחק בדירוג הסופי (כמה "שווה" נקודה לדקה) */
export const SPEED_WEIGHT = 5;

/** המספר המרבי של צורות/מכשולים שיוצגו במקביל על המסך */
export const MAX_OBJECTS_ON_SCREEN = 12;

/**
 * ניקוד בסיס לשאלה בודדת לפי השלב.
 * שלב 1 → 2, שלב 2 → 4, שלב 3 → 6 וכן הלאה.
 */
export function questionPoints(level) {
  return Math.max(1, level) * POINTS_STEP;
}

/**
 * בונוס מהירות. ratio הוא מספר בין 0 ל-1:
 * 1 = ענית מיד, 0 = ענית ברגע האחרון.
 * הבונוס המרבי שווה לניקוד הבסיס, כלומר תשובה מהירה שווה עד פי 2.
 */
export function speedBonus(level, ratio) {
  const r = Math.min(1, Math.max(0, ratio || 0));
  return Math.round(questionPoints(level) * r);
}

/** סך הנקודות עבור תשובה נכונה אחת = בסיס + בונוס מהירות */
export function answerPoints(level, ratio) {
  return questionPoints(level) + speedBonus(level, ratio);
}

/**
 * הדירוג הסופי של שחקן — משלב נקודות וזמן משחק.
 *
 *   rating = נקודות + (נקודות לדקה × SPEED_WEIGHT)
 *
 * כלומר: מי שצבר 300 נקודות ב-3 דקות מדורג גבוה יותר
 * ממי שצבר 300 נקודות ב-10 דקות. activeMs סופר רק זמן
 * משחק פעיל — זמן בהשהיה לא נספר.
 */
export function rating(player) {
  const points = player.points || 0;
  // רצפה של 5 שניות כדי ששחקן חדש לא יקבל דירוג אינסופי
  const minutes = Math.max(player.activeMs || 0, 5000) / 60000;
  const pointsPerMinute = points / minutes;
  return Math.round(points + pointsPerMinute * SPEED_WEIGHT);
}

/** פונקציית מיון ללוח התוצאות: דירוג ↓, נקודות ↓, זמן ↑ */
export function comparePlayers(a, b) {
  const byRating = rating(b) - rating(a);
  if (byRating !== 0) return byRating;
  const byPoints = (b.points || 0) - (a.points || 0);
  if (byPoints !== 0) return byPoints;
  return (a.activeMs || 0) - (b.activeMs || 0);
}

/**
 * הגדרות רמת הקושי לכל שלב. כל המשחקים קוראים מכאן,
 * כך שקצב ההקשחה זהה בשלושתם.
 */
export function levelConfig(level) {
  const l = Math.max(1, level);
  return {
    level: l,
    // משחק הצורות: מתחיל ב-4 צורות ומטפס עד 12
    objectsOnScreen: Math.min(3 + l, MAX_OBJECTS_ON_SCREEN),
    // זמן לשאלה: מתחיל ב-16 שניות, לא יורד מתחת ל-12 בשלב מתקדם
    questionMs: Math.max(12000, 16000 - (l - 1) * 700),
    // מכפיל מהירות למשחקי הקנבס (מכונית / דולר) — עלייה יציבה בין שלבים
    speedFactor: 1 + (l - 1) * 0.12,
    // כמה מכשולים/שודדים פעילים במקביל
    hazards: Math.min(1 + Math.ceil(l / 2), MAX_OBJECTS_ON_SCREEN),
  };
}
