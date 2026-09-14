const SHAPE_TYPES = [
  'circle', 'square', 'triangle', 'star', 'diamond',
  'heart', 'pentagon', 'hexagon', 'octagon', 'cross',
  'arrow', 'moon', 'cloud', 'bolt', 'flower'
];

const COLOR_PALETTE = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE',
  '#30B0C7', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'
];

const SHAPE_PATHS = {
  circle:   '<circle cx="50" cy="50" r="38" fill="COLOR"/>',
  square:   '<rect x="14" y="14" width="72" height="72" rx="10" fill="COLOR"/>',
  triangle: '<polygon points="50,10 90,85 10,85" fill="COLOR"/>',
  star:     '<polygon points="50,6 61,38 95,38 67,58 78,90 50,70 22,90 33,58 5,38 39,38" fill="COLOR"/>',
  diamond:  '<polygon points="50,8 92,50 50,92 8,50" fill="COLOR"/>',
  heart:    '<path d="M50 88 L14 54 C-4 36 20 8 42 26 L50 34 L58 26 C80 8 104 36 86 54 Z" fill="COLOR"/>',
  pentagon: '<polygon points="50,6 95,40 78,90 22,90 5,40" fill="COLOR"/>',
  hexagon:  '<polygon points="28,10 72,10 95,50 72,90 28,90 5,50" fill="COLOR"/>',
  octagon:  '<polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill="COLOR"/>',
  cross:    '<path d="M38 8 H62 V38 H92 V62 H62 V92 H38 V62 H8 V38 H38 Z" fill="COLOR"/>',
  arrow:    '<path d="M10 42 H55 V20 L92 50 L55 80 V58 H10 Z" fill="COLOR"/>',
  moon:     '<path d="M62 8 A42 42 0 1 0 62 92 A34 34 0 1 1 62 8 Z" fill="COLOR" fill-rule="evenodd"/>',
  cloud:    '<path d="M25 68 A18 18 0 0 1 27 33 A24 24 0 0 1 74 30 A18 18 0 0 1 75 68 Z" fill="COLOR"/>',
  bolt:     '<polygon points="55,4 22,56 45,56 38,96 80,42 55,42" fill="COLOR"/>',
  flower:   '<g fill="COLOR"><circle cx="50" cy="26" r="16"/><circle cx="50" cy="74" r="16"/><circle cx="26" cy="50" r="16"/><circle cx="74" cy="50" r="16"/><circle cx="50" cy="50" r="12" fill="white" opacity="0.55"/></g>'
};

// פונקציה עם הגנה: אם מסיבה כלשהי הצורה לא נמצאת ברשימה,
// מציגים ריבוע אפור עם סימן שאלה במקום תא ריק לגמרי.
function shapeSvg(type, color, size) {
  size = size || 60;
  const path = SHAPE_PATHS[type];
  if (!path) {
    console.warn('צורה לא מוכרת:', type);
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