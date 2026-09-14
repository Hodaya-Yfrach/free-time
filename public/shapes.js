const SHAPE_TYPES = [
  'apple', 'banana', 'watermelon', 'grapes', 'cherry',
  'carrot', 'strawberry', 'donut', 'pizza', 'corn',
  'mushroom', 'pineapple', 'orange', 'icecream', 'cupcake'
];

const COLOR_PALETTE = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE',
  '#30B0C7', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'
];

const SHAPE_PATHS = {
  apple:      '<g fill="COLOR"><path d="M50 92 C22 92 8 68 8 50 C8 28 24 15 42 20 C46 10 54 10 58 20 C76 15 92 28 92 50 C92 68 78 92 50 92 Z"/><rect x="45" y="4" width="8" height="18" rx="4"/></g>',
  banana:     '<path d="M18 76 C12 54 24 22 56 12 C62 10 66 16 62 21 C38 30 28 54 34 72 C52 82 76 70 83 49 C85 43 94 45 91 53 C79 84 42 94 18 76 Z" fill="COLOR"/>',
  watermelon: '<path d="M50 50 L50 6 A44 44 0 0 1 88 71 Z" fill="COLOR"/>',
  grapes:     '<g fill="COLOR"><circle cx="34" cy="34" r="15"/><circle cx="56" cy="30" r="15"/><circle cx="45" cy="54" r="15"/><circle cx="26" cy="60" r="15"/><circle cx="62" cy="58" r="15"/><circle cx="45" cy="80" r="15"/></g>',
  cherry:     '<g fill="COLOR"><path d="M36 40 C42 16 58 8 68 6" stroke="COLOR" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="32" cy="66" r="23"/><circle cx="66" cy="70" r="20"/></g>',
  carrot:     '<path d="M50 8 C60 8 66 18 61 28 L36 90 C31 97 19 92 23 84 L47 22 C42 15 41 8 50 8 Z" fill="COLOR"/>',
  strawberry: '<path d="M50 92 L14 44 C-2 20 25 -1 50 27 C75 -1 102 20 86 44 Z" fill="COLOR"/>',
  donut:      '<path d="M50 8 A42 42 0 1 0 50.05 8 Z M50 33 A17 17 0 1 1 49.95 33 Z" fill="COLOR" fill-rule="evenodd"/>',
  pizza:      '<polygon points="50,8 90,92 10,92" fill="COLOR"/>',
  corn:       '<rect x="34" y="6" width="32" height="88" rx="16" fill="COLOR"/>',
  mushroom:   '<g fill="COLOR"><path d="M12 46 A38 38 0 0 1 88 46 Z"/><rect x="37" y="46" width="26" height="42" rx="8"/></g>',
  pineapple:  '<g fill="COLOR"><ellipse cx="50" cy="62" rx="30" ry="34"/><polygon points="50,2 38,26 50,18 62,26"/></g>',
  orange:     '<ellipse cx="50" cy="50" rx="40" ry="36" fill="COLOR"/>',
  icecream:   '<g fill="COLOR"><polygon points="34,52 66,52 50,94"/><circle cx="50" cy="38" r="28"/></g>',
  cupcake:    '<g fill="COLOR"><path d="M24 54 L76 54 L64 94 L36 94 Z"/><circle cx="50" cy="40" r="28"/></g>'
};

// פונקציה עם הגנה: אם מסיבה כלשהי המאכל לא נמצא ברשימה,
// מציגים ריבוע אפור עם סימן שאלה במקום תא ריק לגמרי.
function shapeSvg(type, color, size) {
  size = size || 60;
  const path = SHAPE_PATHS[type];
  if (!path) {
    console.warn('מאכל לא מוכר:', type);
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <rect x="10" y="10" width="80" height="80" rx="10" fill="#e2e8f0"/>
      <text x="50" y="62" font-size="40" text-anchor="middle" fill="#94a3b8">?</text>
    </svg>`;
  }
  const inner = path.split('COLOR').join(color);
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${inner}</svg>`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}