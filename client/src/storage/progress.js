// ============================================================================
//  progress.js — שמירת ההתקדמות בדפדפן (localStorage)
//  ----------------------------------------------------------------------
//  למה localStorage ולא שמירה בשרת?
//  זה נשמר לפי דפדפן ולפי מחשב, לא צריך משתמשים וסיסמאות, והנתונים
//  שורדים רענון של הדף ואפילו כיבוי של המחשב.
//
//  מבנה השמירה — רשומה נפרדת לכל משחק:
//    medal-battle:progress:shapes → { roomCode, name, points, level, activeMs, updatedAt }
//    medal-battle:progress:car    → { ... }
//    medal-battle:progress:dollar → { ... }
//
//  בגלל שהמפתח כולל את מזהה המשחק, מעבר בין משחקים לא נוגע
//  בנקודות של המשחק הקודם — הן פשוט ממתינות במגירה נפרדת.
//  מעבר לחדר אחר *באותו משחק* הוא זה שמחייב אזהרה ואיפוס.
// ============================================================================

const PREFIX = 'medal-battle:progress:';
const NAME_KEY = 'medal-battle:last-name';

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** ההתקדמות השמורה של משחק מסוים, או null אם אין */
export function loadProgress(gameId) {
  if (!gameId) return null;
  const data = safeParse(localStorage.getItem(PREFIX + gameId));
  if (!data || typeof data !== 'object') return null;
  return {
    roomCode: data.roomCode || '',
    name: data.name || '',
    points: Number(data.points) || 0,
    level: Math.max(1, Number(data.level) || 1),
    activeMs: Number(data.activeMs) || 0,
    updatedAt: Number(data.updatedAt) || 0,
  };
}

/** שמירת התקדמות. נקראת אוטומטית כל כמה שניות מתוך מנוע המשחק. */
export function saveProgress(gameId, progress) {
  if (!gameId) return;
  try {
    localStorage.setItem(
      PREFIX + gameId,
      JSON.stringify({ ...progress, updatedAt: Date.now() })
    );
  } catch {
    // מצב פרטי בדפדפן או אחסון מלא — ממשיכים בלי שמירה
  }
}

/** מחיקת ההתקדמות של משחק אחד (למשל כשעוברים חדר) */
export function clearProgress(gameId) {
  try {
    localStorage.removeItem(PREFIX + gameId);
  } catch {
    /* ignore */
  }
}

/** תמונת מצב של כל המשחקים — מוצגת במסך הבחירה */
export function loadAllProgress(gameIds) {
  const out = {};
  for (const id of gameIds) out[id] = loadProgress(id);
  return out;
}

/** השם האחרון שהוזן, כדי לא להקליד אותו שוב בכל כניסה */
export function loadLastName() {
  return localStorage.getItem(NAME_KEY) || '';
}

export function saveLastName(name) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

export function clearBrowserProgress() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) keys.push(key);
      if (key === NAME_KEY) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * הבדיקה שמפעילה את אזהרת מעבר החדר.
 * מחזירה את ההתקדמות שתימחק, או null אם אין מה לאבד.
 */
export function progressAtRisk(gameId, nextRoomCode) {
  const saved = loadProgress(gameId);
  if (!saved || saved.points <= 0) return null;
  if (!saved.roomCode) return null;
  if (saved.roomCode === nextRoomCode) return null; // אותו חדר → ממשיכים מאיפה שהפסקנו
  return saved;
}
