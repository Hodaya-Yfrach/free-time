// ============================================================================
//  questions.js — בניית שאלה אקראית למשחק הצורות
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

function buildFindMissing(config) {
  const count = config.objectsOnScreen;
  const types = pickMany(SHAPE_TYPES, count);
  const full = types.map(makeItem);
  const missing = randomItem(full);
  const partial = shuffle(full.filter((item) => item.key !== missing.key));

  return {
    mode: 'findMissing',
    title: 'איזו צורה חסרה בלוח התחתון?',
    full,
    partial,
    correctKey: missing.key,
  };
}

function buildMatchCategory(config) {
  const target = makeItem(randomItem(SHAPE_TYPES));
  const targetCategory = CATEGORY_OF[target.type];

  const sameFamily = CATEGORIES[targetCategory].items.filter((t) => t !== target.type);
  const correct = makeItem(randomItem(sameFamily));

  const others = SHAPE_TYPES.filter((t) => CATEGORY_OF[t] !== targetCategory);
  const optionsCount = Math.min(3 + Math.floor(config.level / 3), 6);
  const distractors = pickMany(others, optionsCount - 1).map(makeItem);

  return {
    mode: 'matchCategory',
    title: `מי מהחיות הבאות שייכת למשפחת ה${CATEGORIES[targetCategory].label}?`,
    target,
    options: shuffle([correct, ...distractors]),
    correctKey: correct.key,
  };
}

function buildMatchShadow(config) {
  const target = makeItem(randomItem(SHAPE_TYPES));
  const correct = { ...target, key: `s${++uid}`, shadow: true };

  const others = SHAPE_TYPES.filter((t) => t !== target.type);
  const optionsCount = Math.min(3 + Math.floor(config.level / 3), 6);
  const distractors = pickMany(others, optionsCount - 1)
    .map((t) => ({ ...makeItem(t), shadow: true }));

  return {
    mode: 'matchShadow',
    title: 'איזו צללית שייכת לצורה המקורית?',
    target,
    options: shuffle([correct, ...distractors]),
    correctKey: correct.key,
  };
}

export function buildQuestion(config) {
  const mode = randomItem(MODES);
  if (mode === 'findMissing') return buildFindMissing(config);
  if (mode === 'matchCategory') return buildMatchCategory(config);
  return buildMatchShadow(config);
}