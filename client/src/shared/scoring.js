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
    // מכפיל מהירות למשחק הדולר (למכונית יש נוסחת מהירות ייעודית משלה -
    // ר' carSpeedFactor למטה - כי היא צריכה להמשיך לעלות גם אחרי שלב 15
    // ולא להתקבע בגלל תקרה משותפת עם משחק אחר).
    speedFactor: Math.min(1 + (l - 1) * 0.08, 2.1),

    // ---- הגדרות ייעודיות למשחק המכונית ----
    // מדרגות מפורשות לפי בקשה: 2 נתיבים ומכשול אחד בהתחלה, 4 נתיבים
    // משלב 3, מכשול שני משלב 10, 6 נתיבים משלב 29, מכשול שלישי משלב 30.
    lanes: carLanesForLevel(l),
    blockedLanes: carBlockedLanesForLevel(l),

    // ---- הגדרות ייעודיות למשחק הדולר ----
    // כמות השודדים: מתחילה נמוך משמעותית (שודד אחד בשלב 1, לא יותר מדי
    // מייד בהתחלה כמו קודם) ועולה בהדרגה עם השלב, עד תקרה גבוהה יותר (10).
    hazards: Math.min(1 + Math.floor((l - 1) / 2), 10),
  };
}

/** כמות הנתיבים במשחק המכונית, לפי מדרגות מפורשות (לא נוסחה הדרגתית) */
export function carLanesForLevel(level) {
  if (level >= 29) return 6;
  if (level >= 3) return 4;
  return 2;
}

/** כמות המכוניות/המכשולים החוסמים בו-זמנית בשורה אחת, לפי מדרגות מפורשות */
export function carBlockedLanesForLevel(level) {
  if (level >= 30) return 3;
  if (level >= 10) return 2;
  return 1;
}

/**
 * מכפיל המהירות הייעודי למשחק המכונית. בכוונה נפרד מ-speedFactor הכללי
 * (המשותף עם משחק הדולר): כאן צריך עלייה רציפה שממשיכה גם אחרי שלב
 * 15-20 ועד שלב 30 ומעבר, בלי "להתקבע" מוקדם מדי כמו שקרה קודם.
 */
export function carSpeedFactor(level) {
  const l = Math.max(1, level);
  return Math.min(1 + (l - 1) * 0.045, 3);
}
