// ============================================================================
//  questions.js — בניית שאלה אקראית למשחק הצורות
//  ----------------------------------------------------------------------
//  שלושה מצבי משחק, בדיוק כמו בגרסה המקורית:
//    findMissing  — מה חסר בריבוע השני
//    matchCategory— איזה מאכל שייך לאותה קטגוריה
//    matchShadow  — איזו צללית מתאימה לצורה
//
//  מספר הצורות על המסך מגיע מ-levelConfig ועולה עד 12.
// ============================================================================

import {
  SHAPE_TYPES, COLOR_PALETTE, CATEGORIES, CATEGORY_OF,
  randomItem, shuffle, pickMany,
} from './shapeData.js';

const MODES = ['findMissing', 'matchCategory', 'matchShadow'];

let uid = 0;
function makeItem(type) {
  return { key: `s${++uid}`, type, color: randomItem(COLOR_PALETTE) };
}

/** מה חסר: מציגים לוח מלא ולוח חסר, ולוחצים על החסר בלוח המלא */
function buildFindMissing(config) {
  const count = config.objectsOnScreen;
  const types = pickMany(SHAPE_TYPES, count);
  const full = types.map(makeItem);
  const missing = randomItem(full);
  const partial = shuffle(full.filter((item) => item.key !== missing.key));

  return {
    mode: 'findMissing',
    title: 'מה חסר בלוח התחתון?!',
    full,
    partial,
    correctKey: missing.key,
  };
}

/** התאמה לפי קטגוריה: מציגים מטרה, ובוחרים מבין האפשרויות את בן אותה משפחה */
function buildMatchCategory(config) {
  const target = makeItem(randomItem(SHAPE_TYPES));
  const targetCategory = CATEGORY_OF[target.type];

  // תשובה נכונה: מאכל אחר מאותה קטגוריה
  const sameFamily = CATEGORIES[targetCategory].items.filter((t) => t !== target.type);
  const correct = makeItem(randomItem(sameFamily));

  // מסיחים: מאכלים מקטגוריות אחרות
  const others = SHAPE_TYPES.filter((t) => CATEGORY_OF[t] !== targetCategory);
  const optionsCount = Math.min(3 + Math.floor(config.level / 3), 6);
  const distractors = pickMany(others, optionsCount - 1).map(makeItem);

  return {
    mode: 'matchCategory',
    title: `איזה מאכל שייך לקבוצת ${CATEGORIES[targetCategory].label}?`,
    target,
    options: shuffle([correct, ...distractors]),
    correctKey: correct.key,
  };
}

/** צלליות: אותה צורה בדיוק, רק שחורה */
function buildMatchShadow(config) {
  const target = makeItem(randomItem(SHAPE_TYPES));
  const correct = { ...target, key: `s${++uid}`, shadow: true };

  const others = SHAPE_TYPES.filter((t) => t !== target.type);
  const optionsCount = Math.min(3 + Math.floor(config.level / 3), 6);
  const distractors = pickMany(others, optionsCount - 1)
    .map((t) => ({ ...makeItem(t), shadow: true }));

  return {
    mode: 'matchShadow',
    title: 'איזו צללית מתאימה לצורה?',
    target,
    options: shuffle([correct, ...distractors]),
    correctKey: correct.key,
  };
}

/** נקודת הכניסה: מגרילה מצב ובונה שאלה מתאימה */
export function buildQuestion(config) {
  const mode = randomItem(MODES);
  if (mode === 'findMissing') return buildFindMissing(config);
  if (mode === 'matchCategory') return buildMatchCategory(config);
  return buildMatchShadow(config);
}
