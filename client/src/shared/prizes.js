// ============================================================================
//  prizes.js — קטלוג שדרוגי הפרמיום למסך הבונוסים
// ============================================================================

const CAR_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899',
  '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#eab308',
];

const MONEY_SKINS = ['💵', '💶', '💷', '💴', '🪙', '💎'];

const CAR_EMOJIS = ['🚘', '🚙', '🏎️', '🚕', '🚓', '🚐'];

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
        label: `רכב בגימור צבע ייחודי`,
        icon: emoji,
        value: { color, emoji },
      });
    } else {
      const skin = MONEY_SKINS[Math.floor(i / 2) % MONEY_SKINS.length];
      list.push({
        kind: 'color',
        appliesTo: 'dollar',
        label: `סקין יוקרתי לשטר: ${skin}`,
        icon: skin,
        value: { emoji: skin },
      });
    }
    i++;
  }
  return list;
}

const POWERUPS = [
  { kind: 'powerup', effect: 'shield', appliesTo: 'global', trigger: 'auto', label: 'מגן אקטיבי', icon: '🛡️',
    description: 'מגן אוטומטי הסופג פגיעה אחת ללא פסילה', recommendedLevel: 1 },
  { kind: 'powerup', effect: 'shield', appliesTo: 'global', trigger: 'auto', label: 'מגן מתקדם', itemLabel: 'מגן', icon: '🛡️',
    description: 'מערכת הגנה הסופגת עד שתי פגיעות ברצף', charges: 2, recommendedLevel: 4 },
  { kind: 'powerup', effect: 'points', appliesTo: 'global', label: 'בונוס נקודות', icon: '💰',
    description: 'תוספת נקודות מיידית ליתרון בטבלה', params: { questions: 5 }, recommendedLevel: 1 },
  { kind: 'powerup', effect: 'points', appliesTo: 'global', label: 'בונוס אקסקלוסיבי', icon: '💎',
    description: 'הענקת כמות נקודות חריגה ומיידית', params: { questions: 20 }, recommendedLevel: 5 },
  { kind: 'powerup', effect: 'treasure', appliesTo: 'global', label: 'תיבת הפתעה', icon: '🎁',
    description: 'בונוס ניקוד אקראי וגבוה במיוחד', recommendedLevel: 3 },
  { kind: 'powerup', effect: 'score_boost', appliesTo: 'global', label: 'מכפיל ניקוד ×2', icon: '✨',
    description: 'הכפלת כל הניקוד הנצבר למשך 20 שניות', params: { factor: 2, seconds: 20 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'score_boost', appliesTo: 'global', label: 'מכפיל ניקוד ×3', icon: '🔥',
    description: 'שילוש כל הניקוד הנצבר למשך 10 שניות', params: { factor: 3, seconds: 10 }, recommendedLevel: 6 },

  { kind: 'powerup', effect: 'freeze_robbers', appliesTo: 'dollar', label: 'הקפאת שודדים', icon: '🧊',
    description: 'הקפאה מוחלטת של תנועת השודדים (3 שניות)', params: { seconds: 3 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'slow_robbers', appliesTo: 'dollar', label: 'האטת שודדים', icon: '🐌',
    description: 'הפחתת מהירות השודדים בחצי (8 שניות)', params: { seconds: 8 }, recommendedLevel: 1 },
  { kind: 'powerup', effect: 'magnet', appliesTo: 'dollar', label: 'שאיבה מגנטית', icon: '🧲',
    description: 'איסוף אוטומטי של כל המטבעות בגל הנוכחי', recommendedLevel: 3 },
  { kind: 'powerup', effect: 'shockwave', appliesTo: 'dollar', label: 'הדף עוצמתי', icon: '💥',
    description: 'הרחקת כל השודדים אל קצוות המסך', recommendedLevel: 3 },
  { kind: 'powerup', effect: 'ghost_dollar', appliesTo: 'dollar', label: 'חסינות רפאים', icon: '👻',
    description: 'תנועה חופשית דרך השודדים ללא פגיעה (4 שניות)', params: { seconds: 4 }, recommendedLevel: 4 },
  { kind: 'powerup', effect: 'shrink', appliesTo: 'dollar', label: 'מיזעור שטר', icon: '🤏',
    description: 'הקטנת השטר לחמיקה אלגנטית (6 שניות)', params: { seconds: 6 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'decoy', appliesTo: 'dollar', label: 'הטעיית דמה', icon: '🎭',
    description: 'יצירת מטרה חלופית המושכת את האש (5 שניות)', params: { seconds: 5 }, recommendedLevel: 5 },
  { kind: 'powerup', effect: 'dash', appliesTo: 'dollar', label: 'תגובה מהירה', icon: '⚡',
    description: 'שדרוג משמעותי של מהירות התגובה (6 שניות)', params: { seconds: 6 }, recommendedLevel: 2 },

  { kind: 'powerup', effect: 'slow_road', appliesTo: 'car', label: 'האטת תנועה', icon: '🐌',
    description: 'האטת קצב הכביש במחצית (6 שניות)', params: { seconds: 6 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'freeze_road', appliesTo: 'car', label: 'עצירת זרימה', icon: '⏸️',
    description: 'עצירה מוחלטת של התנועה בכביש (2.5 שניות)', params: { seconds: 2.5 }, recommendedLevel: 4 },
  { kind: 'powerup', effect: 'ghost_car', appliesTo: 'car', label: 'חסינות זמנית', icon: '👻',
    description: 'מעבר בטוח דרך מכשולים ללא נזק (3 שניות)', params: { seconds: 3 }, recommendedLevel: 3 },
  { kind: 'powerup', effect: 'mini_car', appliesTo: 'car', label: 'רכב קומפקטי', icon: '🐜',
    description: 'הקטנת הרכב לתמרון נוח יותר (8 שניות)', params: { seconds: 8 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'sweeper', appliesTo: 'car', label: 'ניקוי כביש', icon: '🧹',
    description: 'פינוי מיידי של כל המכשולים מהמסך', recommendedLevel: 5 },
  { kind: 'powerup', effect: 'gps', appliesTo: 'car', label: 'מערכת ניווט', icon: '🧭',
    description: 'תצוגה חיה של הנתיב הבטוח ביותר (10 שניות)', params: { seconds: 10 }, recommendedLevel: 1 },
  { kind: 'powerup', effect: 'sport_steer', appliesTo: 'car', label: 'היגוי ספורט', icon: '🏎️',
    description: 'שיפור ביצועי ההיגוי וזמני התגובה (8 שניות)', params: { seconds: 8 }, recommendedLevel: 1 },

  { kind: 'powerup', effect: 'fifty_fifty', appliesTo: 'shapes', label: 'חצי-חצי', icon: '✂️',
    description: 'הסרת 50% מהתשובות השגויות מהלוח', recommendedLevel: 1 },
  { kind: 'powerup', effect: 'hint', appliesTo: 'shapes', label: 'רמז חזותי', icon: '💡',
    description: 'הבהוב אלגנטי ומהיר המכוון לתשובה הנכונה', recommendedLevel: 1 },
  { kind: 'powerup', effect: 'time_plus', appliesTo: 'shapes', label: 'תוספת 5 שניות', icon: '⏱️',
    description: 'הארכת שעון העצר ב-5 שניות נוספות', params: { seconds: 5 }, recommendedLevel: 1 },
  { kind: 'powerup', effect: 'time_plus', appliesTo: 'shapes', label: 'תוספת 10 שניות', icon: '⏰',
    description: 'הארכת שעון העצר ב-10 שניות נוספות', params: { seconds: 10 }, recommendedLevel: 5 },
  { kind: 'powerup', effect: 'freeze_time', appliesTo: 'shapes', label: 'הקפאת שעון', icon: '❄️',
    description: 'עצירת שעון העצר לחלוטין (5 שניות)', params: { seconds: 5 }, recommendedLevel: 3 },
  { kind: 'powerup', effect: 'reveal_shadow', appliesTo: 'shapes', label: 'חשיפת צלליות', icon: '🔦',
    description: 'ביטול אפקט ההצללה חושף את הצורות (3 שניות)', params: { seconds: 3 }, recommendedLevel: 2 },
  { kind: 'powerup', effect: 'reroll', appliesTo: 'shapes', label: 'רענון שאלה', icon: '🔄',
    description: 'החלפת השאלה הנוכחית ללא ספיגת פגיעה', recommendedLevel: 2 },
  { kind: 'powerup', effect: 'auto_solve', appliesTo: 'shapes', label: 'מענה אוטומטי', icon: '🎯',
    description: 'השלמה אוטומטית ומושלמת לשאלה הנוכחית', recommendedLevel: 6 },
];

function buildBank() {
  const bank = [];

  bank.push({
    kind: 'skip',
    appliesTo: 'global',
    label: 'דילוג לשלב הבא',
    icon: '⏭️',
    limitedUses: 2,
    warning: 'שימי לב: הטבת הדילוג מוגבלת ל-2 פעמים למשתמש (מומלץ לשמור לשלבים מתקדמים - בהמשך ייפתחו שדרוגים אקסקלוסיביים נוספים).',
  });

  bank.push(...POWERUPS);

  const generated = buildGeneratedPrizes(99 - POWERUPS.length);
  bank.push(...generated);

  return bank.map((p, index) => ({
    id: `prize-${index + 1}`,
    ...p,
    recommendedLevel: p.recommendedLevel ?? Math.max(1, Math.floor(index / 6)),
  }));
}

export const PRIZES = buildBank();

export const SKIP_PRIZE = PRIZES[0];

export const POWERUP_LABEL_ORDER = [...new Set(PRIZES.filter((p) => p.kind === 'powerup').map((p) => p.itemLabel || p.label))];

const COSMETIC_CHANCE = 0.25;

export function rollPrizeOptions({ gameId, level, count = 3 }) {
  const relevant = PRIZES.filter(
    (p) => p.appliesTo === 'global' || p.appliesTo === gameId
  );
  const unlocked = relevant.filter((p) => p.recommendedLevel <= level + 2);
  const pool = unlocked.length >= count ? unlocked : relevant;

  const powerups = pool.filter((p) => p.kind === 'powerup');
  const cosmetics = pool.filter((p) => p.kind === 'color' && p.appliesTo === gameId);
  const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

  const picks = shuffle(powerups).slice(0, count - 1);
  if (cosmetics.length && picks.length && Math.random() < COSMETIC_CHANCE) {
    picks[picks.length - 1] = shuffle(cosmetics)[0];
  }

  return [SKIP_PRIZE, ...picks];
}