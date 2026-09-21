// ============================================================================
//  games.js — קטלוג המשחקים
//  השרת צריך את השמות כדי להציג אותם ברשימת החדרים הפעילים.
//  הקובץ המקביל בלקוח: client/src/shared/games.js
// ============================================================================

export const GAMES = {
<<<<<<< HEAD
  shapes: { id: 'shapes', name: 'קרב הצורות', icon: '🍎' },
=======
  shapes: { id: 'shapes', name: 'קרב הצורות', icon: '🦁' },
>>>>>>> upgrade-v3
  car:    { id: 'car',    name: 'מרוץ המכשולים', icon: '🚗' },
  dollar: { id: 'dollar', name: 'בריחת הדולר', icon: '💵' },
};

export const DEFAULT_GAME = 'shapes';

export function isValidGame(id) {
  return Object.prototype.hasOwnProperty.call(GAMES, id);
}
