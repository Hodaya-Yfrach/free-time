// ============================================================================
//  prizesStorage.js — שמירת "סל הקניות" (הפרסים שנרכשו) בדפדפן
//  ----------------------------------------------------------------------
//  בכוונה *לא* לפי משחק כמו progress.js: פרס שנרכש שייך למשתמש/ת (לדפדפן
//  הזה) ולא לחדר או למשחק מסוים - במיוחד מונה השימושים בפרס "דילוג",
//  שהמגבלה שלו היא "עד 2 פעמים לכל משתמש" ולא לכל משחק בנפרד.
// ============================================================================

const OWNED_KEY = 'medal-battle:owned-prizes';
const SKIP_USES_KEY = 'medal-battle:skip-uses';
const MEDALS_KEY = 'medal-battle:medals-count';
const POWERUPS_KEY = 'medal-battle:powerups';

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/** כל הפרסים שהמשתמש/ת כבר רכש/ה (לתצוגת "סל הקניות") */
export function loadOwnedPrizes() {
  return safeGet(OWNED_KEY, []);
}

export function addOwnedPrize(prize) {
  const owned = loadOwnedPrizes();
  owned.push({
    id: prize.id,
    label: prize.label,
    icon: prize.icon,
    appliesTo: prize.appliesTo,
    value: prize.value || null, // הצבע/העיצוב בפועל - זה מה שהמשחק קורא כדי להציג את הפרס
    acquiredAt: Date.now(),
  });
  safeSet(OWNED_KEY, owned);
  return owned;
}

/** כמה פעמים כבר נוצל פרס הדילוג (מוגבל ל-2 בסך הכול, לכל המשחקים יחד) */
export function loadSkipUsesLeft(limit) {
  const used = safeGet(SKIP_USES_KEY, 0);
  return Math.max(0, limit - used);
}

export function consumeSkipUse() {
  const used = safeGet(SKIP_USES_KEY, 0);
  safeSet(SKIP_USES_KEY, used + 1);
}

/** סך המדליות שנצברו אי-פעם - קובע מתי נפתחת בחירת פרס (כל 3 מדליות) */
export function loadMedalsCount() {
  return safeGet(MEDALS_KEY, 0);
}
export function incrementMedalsCount() {
  const next = loadMedalsCount() + 1;
  safeSet(MEDALS_KEY, next);
  return next;
}

/** מציאת "הפריט המצויד" הנוכחי למשחק מסוים - הפרס העיצובי האחרון שנרכש עבורו */
export function loadEquippedForGame(gameId) {
  const owned = loadOwnedPrizes().filter((p) => p.appliesTo === gameId);
  return owned.length ? owned[owned.length - 1] : null;
}

export function loadPowerups() {
  return safeGet(POWERUPS_KEY, []);
}

export function addPowerups(prize) {
  const list = loadPowerups();
  const charges = prize.charges || 1;
  for (let i = 0; i < charges; i++) {
    list.push({
      uid: `${prize.id}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      effect: prize.effect,
      label: prize.itemLabel || prize.label,
      icon: prize.icon,
      description: prize.description,
      appliesTo: prize.appliesTo,
      trigger: prize.trigger || 'manual',
      params: prize.params || null,
      acquiredAt: Date.now(),
    });
  }
  safeSet(POWERUPS_KEY, list);
  return list;
}

export function removePowerup(uid) {
  const list = loadPowerups().filter((p) => p.uid !== uid);
  safeSet(POWERUPS_KEY, list);
  return list;
}

export function clearAllBrowserRewards() {
  try {
    localStorage.removeItem(OWNED_KEY);
    localStorage.removeItem(SKIP_USES_KEY);
    localStorage.removeItem(MEDALS_KEY);
    localStorage.removeItem(POWERUPS_KEY);
  } catch {
    /* ignore */
  }
}
