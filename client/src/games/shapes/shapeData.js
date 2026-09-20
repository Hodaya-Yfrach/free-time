// ============================================================================
//  shapeData.js — מאגר החיות, הצבעים והקטגוריות
//  ----------------------------------------------------------------------
//  החיות מוצגות כאמוג'י בתוך SVG, כך שאפשר להפוך אותן לצללית שחורה
//  (ר' shape-svg--shadow ב-index.css) בלי לצייר כל חיה ביד.
//  CATEGORIES — שיוך כל חיה לקבוצה, כדי שמצב "התאימו לפי סוג החיה"
//  יוכל לבחור תשובה נכונה באמת.
// ============================================================================

/** שיוך כל חיה לקטגוריה. זו הבסיס למצב ההתאמה. */
export const CATEGORIES = {
  pets: {
    label: 'חיות בית',
    items: ['dog', 'cat', 'rabbit'],
  },
  farm: {
    label: 'חיות משק',
    items: ['cow', 'pig', 'sheep', 'goat', 'horse'],
  },
  wild: {
    label: 'חיות בר',
    items: ['elephant', 'giraffe', 'zebra', 'rhino', 'tiger', 'kangaroo'],
  },
  sea: {
    label: 'חיות ים',
    items: ['dolphin', 'whale', 'shark', 'octopus', 'crab', 'fish'],
  },
  birds: {
    label: 'ציפורים',
    items: ['owl', 'penguin', 'eagle', 'parrot', 'swan', 'peacock'],
  },
  insects: {
    label: 'חרקים',
    items: ['bee', 'butterfly', 'ant', 'ladybug', 'cricket'],
  },
  reptiles: {
    label: 'זוחלים',
    items: ['snake', 'crocodile', 'lizard'],
  },
};

export const SHAPE_TYPES = Object.values(CATEGORIES).flatMap((c) => c.items);

/** חיה → מזהה הקטגוריה שלה */
export const CATEGORY_OF = Object.entries(CATEGORIES).reduce((map, [key, group]) => {
  for (const item of group.items) map[item] = key;
  return map;
}, {});

/** 12 צבעים מובחנים לחלוטין, כדי שלא יהיה בלבול בין שתי צורות */
export const COLOR_PALETTE = [
  '#FF0000', // אדום עז
  '#0000FF', // כחול עמוק
  '#00C000', // ירוק
  '#FFC400', // צהוב־ענבר
  '#FF00FF', // מגנטה
  '#00CFCF', // טורקיז
  '#FF8800', // כתום
  '#8800FF', // סגול
  '#8B4513', // חום
  '#00FA9A', // ירוק מנטה
  '#FF1493', // ורוד פוקסיה
  '#1E90FF', // כחול שמיים
];

export const ANIMAL_EMOJI = {
  dog: '🐕', cat: '🐈', rabbit: '🐇',
  cow: '🐄', pig: '🐖', sheep: '🐑', goat: '🐐', horse: '🐎',
  elephant: '🐘', giraffe: '🦒', zebra: '🦓', rhino: '🦏', tiger: '🐅', kangaroo: '🦘',
  dolphin: '🐬', whale: '🐳', shark: '🦈', octopus: '🐙', crab: '🦀', fish: '🐟',
  owl: '🦉', penguin: '🐧', eagle: '🦅', parrot: '🦜', swan: '🦢', peacock: '🦚',
  bee: '🐝', butterfly: '🦋', ant: '🐜', ladybug: '🐞', cricket: '🦗',
  snake: '🐍', crocodile: '🐊', lizard: '🦎',
};

/** בונה מחרוזת SVG מוכנה להזרקה עם האמוג'י של החיה (הצבע לא משפיע - האמוג'י צבעוני מעצמו) */
export function shapeSvg(type, color, size = 60) {
  const emoji = ANIMAL_EMOJI[type];
  if (!emoji) {
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <rect x="10" y="10" width="80" height="80" rx="10" fill="#e2e8f0"/>
      <text x="50" y="62" font-size="40" text-anchor="middle" fill="#94a3b8">?</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <text x="50" y="54" font-size="78" text-anchor="middle" dominant-baseline="central"
      font-family="'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif">${emoji}</text>
  </svg>`;
}

// ------------------------------- עזרי אקראיות -------------------------------

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** בוחר n פריטים שונים מתוך מערך */
export function pickMany(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}
