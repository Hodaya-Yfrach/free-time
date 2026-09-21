// ============================================================================
//  questions.js — בניית שאלה אקראית למשחק הצורות
<<<<<<< HEAD
//  ----------------------------------------------------------------------
//  שלושה מצבי משחק, בדיוק כמו בגרסה המקורית:
//    findMissing  — מה חסר בריבוע השני
//    matchCategory— איזה מאכל שייך לאותה קטגוריה
//    matchShadow  — איזו צללית מתאימה לצורה
//
//  מספר הצורות על המסך מגיע מ-levelConfig ועולה עד 12.
=======
>>>>>>> upgrade-v3
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

<<<<<<< HEAD
/** מה חסר: מציגים לוח מלא ולוח חסר, ולוחצים על החסר בלוח המלא */
=======
>>>>>>> upgrade-v3
function buildFindMissing(config) {
  const count = config.objectsOnScreen;
  const types = pickMany(SHAPE_TYPES, count);
  const full = types.map(makeItem);
  const missing = randomItem(full);
  const partial = shuffle(full.filter((item) => item.key !== missing.key));

  return {
    mode: 'findMissing',
<<<<<<< HEAD
    title: 'מה חסר בלוח התחתון?!',
=======
    title: 'איזו צורה חסרה בלוח התחתון?',
>>>>>>> upgrade-v3
    full,
    partial,
    correctKey: missing.key,
  };
}

<<<<<<< HEAD
/** התאמה לפי קטגוריה: מציגים מטרה, ובוחרים מבין האפשרויות את בן אותה משפחה */
=======
>>>>>>> upgrade-v3
function buildMatchCategory(config) {
  const target = makeItem(randomItem(SHAPE_TYPES));
  const targetCategory = CATEGORY_OF[target.type];

<<<<<<< HEAD
  // תשובה נכונה: מאכל אחר מאותה קטגוריה
  const sameFamily = CATEGORIES[targetCategory].items.filter((t) => t !== target.type);
  const correct = makeItem(randomItem(sameFamily));

  // מסיחים: מאכלים מקטגוריות אחרות
=======
  const sameFamily = CATEGORIES[targetCategory].items.filter((t) => t !== target.type);
  const correct = makeItem(randomItem(sameFamily));

>>>>>>> upgrade-v3
  const others = SHAPE_TYPES.filter((t) => CATEGORY_OF[t] !== targetCategory);
  const optionsCount = Math.min(3 + Math.floor(config.level / 3), 6);
  const distractors = pickMany(others, optionsCount - 1).map(makeItem);

  return {
    mode: 'matchCategory',
<<<<<<< HEAD
    title: `איזה מאכל שייך לקבוצת ${CATEGORIES[targetCategory].label}?`,
=======
    title: `מי מהחיות הבאות שייכת למשפחת ה${CATEGORIES[targetCategory].label}?`,
>>>>>>> upgrade-v3
    target,
    options: shuffle([correct, ...distractors]),
    correctKey: correct.key,
  };
}

<<<<<<< HEAD
/** צלליות: אותה צורה בדיוק, רק שחורה */
=======
>>>>>>> upgrade-v3
function buildMatchShadow(config) {
  const target = makeItem(randomItem(SHAPE_TYPES));
  const correct = { ...target, key: `s${++uid}`, shadow: true };

  const others = SHAPE_TYPES.filter((t) => t !== target.type);
  const optionsCount = Math.min(3 + Math.floor(config.level / 3), 6);
  const distractors = pickMany(others, optionsCount - 1)
    .map((t) => ({ ...makeItem(t), shadow: true }));

  return {
    mode: 'matchShadow',
<<<<<<< HEAD
    title: 'איזו צללית מתאימה לצורה?',
=======
    title: 'איזו צללית שייכת לצורה המקורית?',
>>>>>>> upgrade-v3
    target,
    options: shuffle([correct, ...distractors]),
    correctKey: correct.key,
  };
}

<<<<<<< HEAD
/** נקודת הכניסה: מגרילה מצב ובונה שאלה מתאימה */
=======
>>>>>>> upgrade-v3
export function buildQuestion(config) {
  const mode = randomItem(MODES);
  if (mode === 'findMissing') return buildFindMissing(config);
  if (mode === 'matchCategory') return buildMatchCategory(config);
  return buildMatchShadow(config);
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
