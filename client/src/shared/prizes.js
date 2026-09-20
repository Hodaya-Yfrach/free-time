// ============================================================================
//  prizes.js — קטלוג הפרסים למסך "בחרי פרס" (נפתח כל 3 מדליות)
//  ----------------------------------------------------------------------
//  בדיוק כמו riddles.js: 100 פרסים בסך הכול, אבל רובם נבנים אוטומטית
//  (שילובי צבע × משחק) כדי לא לכתוב 100 שורות ידנית.
//
//  סוגי פרס:
//    'skip'  — דילוג לשלב הבא. מוגבל ל-2 פעמים לכל משתמש (כל הדפדפן,
//              לא לכל משחק בנפרד) - זה בדיוק מה שהמשתמשת ביקשה.
//    'color' — שינוי צבע/עיצוב חזותי למכונית או לשטר הדולר.
//    'theme' — פרסים "מעניינים" יותר שנפתחים רק בשלבים מתקדמים
//              (אפקט זנב, הילה זוהרת וכו') - הרעיון של "מומלץ לבחור
//              בשלבים מתקדמים, יש פרסים יותר מעניינים".
// ============================================================================

const CAR_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899',
  '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#eab308',
];

const MONEY_SKINS = ['💵', '💶', '💷', '💴', '🪙', '💎'];

const CAR_EMOJIS = ['🚗', '🚙', '🏎️', '🚕', '🚓', '🚐'];

function buildGeneratedPrizes(count) {
  const list = [];
  let i = 0;
  while (list.length < count) {
    const isCar = i % 2 === 0;
    if (isCar) {
      const color = CAR_COLORS[Math.floor(i / 2) % CAR_COLORS.length];
      const emoji = CAR_EMOJIS[Math.floor(i / (CAR_COLORS.length * 2)) % CAR_EMOJIS.length];
      list.push({
        kind: 'color',
        appliesTo: 'car',
        label: `מכונית בצבע ${color}`,
        icon: emoji,
        value: { color, emoji },
      });
    } else {
      const skin = MONEY_SKINS[Math.floor(i / 2) % MONEY_SKINS.length];
      list.push({
        kind: 'color',
        appliesTo: 'dollar',
        label: `עיצוב שטר: ${skin}`,
        icon: skin,
        value: { emoji: skin },
      });
    }
    i++;
  }
  return list;
}

const POWERUPS = [
  { kind: 'powerup', effect: 'shield', appliesTo: 'global', trigger: 'auto', label: 'מגן', icon: '🛡️',
    description: 'סופג טעות אחת בלי שתפסידי', recommendedLevel: 1 },
  { kind: 'powerup', effect: 'shield', appliesTo: 'global', trigger: 'auto', label: 'מגן כפול', itemLabel: 'מגן', icon: '🛡️',
    description: 'סופג שתי טעויות', charges: 2, recommendedLevel: 4 },
  { kind: 'powerup', effect: 'points', appliesTo: 'global', label: 'בונוס נקודות', icon: '💰',
    description: 'נקודות מיידיות', params: { questions: 5 }, recommendedLevel: 1 },
  { kind: 'powerup', effect: 'points', appliesTo: 'global', label: 'בונוס גדול', icon: '💎',
    description: 'הרבה נקודות מיידיות', params: { questions: 20 }, recommendedLevel: 5 },
  { kind: 'powerup', effect: 'treasure', appliesTo: 'global', label: 'תיבת אוצר', icon: '🎁',
    description: 'סכום נקודות מוגרל', recommendedLevel: 3 },
  { kind: 'powerup', effect: 'score_boost', appliesTo: 'global', label: 'כפל ניקוד ×2', icon: '✨',
    description: 'כל ניקוד כפול ל-20 שניות', params: { factor: 2, seconds: 20 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'score_boost', appliesTo: 'global', label: 'כפל ניקוד ×3', icon: '🔥',
    description: 'כל ניקוד משולש ל-10 שניות', params: { factor: 3, seconds: 10 }, recommendedLevel: 6 },

  { kind: 'powerup', effect: 'freeze_robbers', appliesTo: 'dollar', label: 'הקפאת שודדים', icon: '🧊',
    description: 'השודדים קפואים ל-3 שניות', params: { seconds: 3 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'slow_robbers', appliesTo: 'dollar', label: 'האטת שודדים', icon: '🐌',
    description: 'השודדים איטיים פי 2 ל-8 שניות', params: { seconds: 8 }, recommendedLevel: 1 },
  { kind: 'powerup', effect: 'magnet', appliesTo: 'dollar', label: 'מגנט מטבעות', icon: '🧲',
    description: 'אוסף את כל מטבעות הגל הנוכחי', recommendedLevel: 3 },
  { kind: 'powerup', effect: 'shockwave', appliesTo: 'dollar', label: 'גל הדף', icon: '💥',
    description: 'זורק את כל השודדים לפינות', recommendedLevel: 3 },
  { kind: 'powerup', effect: 'ghost_dollar', appliesTo: 'dollar', label: 'שטר רוח רפאים', icon: '👻',
    description: 'עוברים דרך שודדים ל-4 שניות', params: { seconds: 4 }, recommendedLevel: 4 },
  { kind: 'powerup', effect: 'shrink', appliesTo: 'dollar', label: 'שטר מכווץ', icon: '🤏',
    description: 'השטר קטן פי 2 ל-6 שניות', params: { seconds: 6 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'decoy', appliesTo: 'dollar', label: 'שטר דמה', icon: '🎭',
    description: 'השודדים רודפים אחרי דמה ל-5 שניות', params: { seconds: 5 }, recommendedLevel: 5 },
  { kind: 'powerup', effect: 'dash', appliesTo: 'dollar', label: 'שטר זריז', icon: '⚡',
    description: 'השטר מגיב מהר יותר ל-6 שניות', params: { seconds: 6 }, recommendedLevel: 2 },

  { kind: 'powerup', effect: 'slow_road', appliesTo: 'car', label: 'האטת הכביש', icon: '🐌',
    description: 'כל התנועה איטית פי 2 ל-6 שניות', params: { seconds: 6 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'freeze_road', appliesTo: 'car', label: 'עצירת תנועה', icon: '⏸️',
    description: 'הכביש קופא ל-2.5 שניות', params: { seconds: 2.5 }, recommendedLevel: 4 },
  { kind: 'powerup', effect: 'ghost_car', appliesTo: 'car', label: 'מצב רוח רפאים', icon: '👻',
    description: 'עוברים דרך מכשולים ל-3 שניות', params: { seconds: 3 }, recommendedLevel: 3 },
  { kind: 'powerup', effect: 'mini_car', appliesTo: 'car', label: 'מכונית מיני', icon: '🐜',
    description: 'המכונית קטנה פי 2 ל-8 שניות', params: { seconds: 8 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'sweeper', appliesTo: 'car', label: 'מטאטא כביש', icon: '🧹',
    description: 'מפנה את כל המכשולים שעל המסך', recommendedLevel: 5 },
  { kind: 'powerup', effect: 'gps', appliesTo: 'car', label: 'GPS', icon: '🧭',
    description: 'מסמן את הנתיב הפנוי ביותר ל-10 שניות', params: { seconds: 10 }, recommendedLevel: 1 },
  { kind: 'powerup', effect: 'sport_steer', appliesTo: 'car', label: 'היגוי ספורט', icon: '🏎️',
    description: 'המכונית מגיבה מהר יותר ל-8 שניות', params: { seconds: 8 }, recommendedLevel: 1 },

  { kind: 'powerup', effect: 'fifty_fifty', appliesTo: 'shapes', label: 'חצי-חצי', icon: '✂️',
    description: 'מעלים חצי מהתשובות השגויות', recommendedLevel: 1 },
  { kind: 'powerup', effect: 'hint', appliesTo: 'shapes', label: 'רמז מהבהב', icon: '💡',
    description: 'התשובה הנכונה מהבהבת לרגע', recommendedLevel: 1 },
  { kind: 'powerup', effect: 'time_plus', appliesTo: 'shapes', label: '+5 שניות', icon: '⏱️',
    description: 'מוסיף 5 שניות לשעון', params: { seconds: 5 }, recommendedLevel: 1 },
  { kind: 'powerup', effect: 'time_plus', appliesTo: 'shapes', label: '+10 שניות', icon: '⏰',
    description: 'מוסיף 10 שניות לשעון', params: { seconds: 10 }, recommendedLevel: 5 },
  { kind: 'powerup', effect: 'freeze_time', appliesTo: 'shapes', label: 'הקפאת זמן', icon: '❄️',
    description: 'השעון עוצר ל-5 שניות', params: { seconds: 5 }, recommendedLevel: 3 },
  { kind: 'powerup', effect: 'reveal_shadow', appliesTo: 'shapes', label: 'פנס קסם', icon: '🔦',
    description: 'חושף את הצבעים של הצלליות ל-3 שניות', params: { seconds: 3 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'reroll', appliesTo: 'shapes', label: 'שאלה חדשה', icon: '🔄',
    description: 'מחליף את השאלה בלי לפסול', recommendedLevel: 2 },
  { kind: 'powerup', effect: 'auto_solve', appliesTo: 'shapes', label: 'פתרון מיידי', icon: '🎯',
    description: 'פותר את השאלה הנוכחית', recommendedLevel: 6 },
];

function buildBank() {
  const bank = [];

  // פרס #1: דילוג לשלב הבא - הפרס היחיד שמוגבל בכמות שימושים
  bank.push({
    kind: 'skip',
    appliesTo: 'global',
    label: 'דילוג לשלב הבא',
    icon: '⏭️',
    limitedUses: 2,
    warning: 'שימי לב: קניית פרס זה מתאפשרת עד 2 פעמים לכל משתמש (מומלץ לבחור בשלבים מתקדמים - יהיו עוד פרסים מעניינים יותר, כמו שינוי המכונית).',
  });

  bank.push(...POWERUPS);

  // שאר הפרסים - נבנים אוטומטית (צבעים/עיצובים למכונית ולדולר) עד 100 בסך הכול
  const generated = buildGeneratedPrizes(99 - POWERUPS.length);
  bank.push(...generated);

  return bank.map((p, index) => ({
    id: `prize-${index + 1}`,
    ...p,
    // "מומלץ לשלבים מתקדמים" - ככל שהאינדקס גבוה יותר, הפרס "נפתח" רק
    // משלב מאוחר יותר, כך שהפרסים המעניינים באמת שמורים להמשך המשחק.
    recommendedLevel: p.recommendedLevel ?? Math.max(1, Math.floor(index / 6)),
  }));
}

export const PRIZES = buildBank();

export const SKIP_PRIZE = PRIZES[0];

export const POWERUP_LABEL_ORDER = [...new Set(PRIZES.filter((p) => p.kind === 'powerup').map((p) => p.itemLabel || p.label))];

const COSMETIC_CHANCE = 0.25;

/** מחזיר n פרסים אקראיים המתאימים למשחק הנוכחי ולשלב הנוכחי, כולל תמיד את פרס הדילוג כאופציה */
export function rollPrizeOptions({ gameId, level, count = 3 }) {
  const relevant = PRIZES.filter(
    (p) => p.appliesTo === 'global' || p.appliesTo === gameId
  );
  // מעדיפים פרסים שמתאימים לרמת השלב הנוכחית, אבל תמיד יש ברירת מחדל
  const unlocked = relevant.filter((p) => p.recommendedLevel <= level + 2);
  const pool = unlocked.length >= count ? unlocked : relevant;

  const powerups = pool.filter((p) => p.kind === 'powerup');
  const cosmetics = pool.filter((p) => p.kind === 'color' && p.appliesTo === gameId);
  const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

  const picks = shuffle(powerups).slice(0, count - 1);
  if (cosmetics.length && picks.length && Math.random() < COSMETIC_CHANCE) {
    picks[picks.length - 1] = shuffle(cosmetics)[0];
  }

  // פרס הדילוג תמיד מוצג כאופציה נוספת (גם אם המכסה נגמרה - נסביר את זה ב-UI)
  return [SKIP_PRIZE, ...picks];
}
