const SHAPE_TYPES = [
  'apple', 'banana', 'watermelon', 'grapes', 'cherry',
  'carrot', 'strawberry', 'donut', 'pizza', 'corn',
  'mushroom', 'pineapple', 'orange', 'icecream', 'cupcake',
  'avocado', 'lemon', 'eggplant', 'pear', 'pomegranate'
];

// 12 צבעים מובחנים לחלוטין כדי למנוע בלבול
const COLOR_PALETTE = [
  '#FF0000', // אדום עז
  '#0000FF', // כחול עמוק
  '#00FF00', // ירוק ניאון
  '#FFFF00', // צהוב
  '#FF00FF', // מגנטה/ורוד זוהר
  '#00FFFF', // תכלת/טורקיז
  '#FF8800', // כתום
  '#8800FF', // סגול
  '#8B4513', // חום
  '#00FA9A', // ירוק מנטה
  '#FF1493', // ורוד פוקסיה
  '#1E90FF'  // כחול שמיים
];

const SHAPE_PATHS = {
  apple: `
    <g>
      <path d="M50 22 C48 12 55 4 55 4" stroke="#795548" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M54 14 C65 4 78 8 75 20 C71 32 58 24 54 14 Z" fill="#689F38"/>
      <path d="M50 94 C20 94 10 72 15 50 C20 28 38 22 50 32 C62 22 80 28 85 50 C90 72 80 94 50 94 Z" fill="COLOR"/>
      <path d="M28 48 C24 60 32 75 42 80 C34 72 28 58 28 48 Z" fill="rgba(255,255,255,0.25)"/>
    </g>`,
  banana: `
    <g>
      <path d="M20 85 C40 95 70 90 85 50 C95 20 85 10 85 10 C85 10 75 20 65 35 C50 60 35 70 15 70 C10 70 20 85 20 85 Z" fill="COLOR"/>
      <path d="M85 10 L88 5 L81 8 Z" fill="#5D4037"/>
      <path d="M15 70 L10 76 L20 85 Z" fill="#5D4037"/>
      <path d="M22 81 C40 86 58 72 68 45" stroke="rgba(0,0,0,0.12)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>`,
  watermelon: `
    <g>
      <path d="M10 25 C10 75 90 75 90 25 Z" fill="#2E7D32"/>
      <path d="M15 28 C15 70 85 70 85 28 Z" fill="#F1F8E9"/>
      <path d="M20 31 C20 65 80 65 80 31 Z" fill="COLOR"/>
      <g fill="#3E2723">
        <circle cx="35" cy="42" r="2.5"/><circle cx="50" cy="48" r="2.5"/>
        <circle cx="65" cy="42" r="2.5"/><circle cx="43" cy="55" r="2.5"/>
        <circle cx="57" cy="55" r="2.5"/>
      </g>
    </g>`,
  grapes: `
    <g>
      <path d="M50 15 C55 5 65 8 65 8" stroke="#795548" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M55 12 C40 10 30 20 35 30 C45 28 55 20 55 12 Z" fill="#689F38"/>
      <g fill="COLOR">
        <circle cx="38" cy="35" r="12"/><circle cx="62" cy="35" r="12"/>
        <circle cx="50" cy="45" r="12"/><circle cx="30" cy="55" r="12"/>
        <circle cx="70" cy="55" r="12"/><circle cx="50" cy="65" r="12"/>
        <circle cx="38" cy="75" r="12"/><circle cx="62" cy="75" r="12"/>
        <circle cx="50" cy="85" r="12"/>
      </g>
      <g fill="rgba(255,255,255,0.3)">
        <circle cx="35" cy="32" r="3"/><circle cx="59" cy="32" r="3"/>
        <circle cx="47" cy="42" r="3"/><circle cx="27" cy="52" r="3"/>
        <circle cx="67" cy="52" r="3"/><circle cx="47" cy="62" r="3"/>
        <circle cx="35" cy="72" r="3"/><circle cx="59" cy="72" r="3"/>
        <circle cx="47" cy="82" r="3"/>
      </g>
    </g>`,
  cherry: `
    <g>
      <path d="M35 55 Q45 25 55 15" stroke="#689F38" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M65 55 Q60 25 55 15" stroke="#689F38" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M55 15 C45 5 30 10 35 25 C45 20 55 20 55 15 Z" fill="#8BC34A"/>
      <circle cx="30" cy="70" r="18" fill="COLOR"/>
      <circle cx="70" cy="70" r="18" fill="COLOR"/>
      <path d="M22 65 A10 10 0 0 1 28 60" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M62 65 A10 10 0 0 1 68 60" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>`,
  carrot: `
    <g>
      <path d="M50 25 C62 25 70 35 60 50 L40 92 C36 98 24 92 28 82 L50 25 Z" fill="COLOR"/>
      <path d="M52 25 C48 10 35 5 35 5 M52 25 C55 10 65 8 65 8 M52 25 C50 8 55 2 55 2" stroke="#689F38" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M48 45 L55 42 M42 60 L48 58 M36 75 L42 73" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>`,
  strawberry: `
    <g>
      <path d="M50 95 C20 70 10 40 25 25 C40 10 60 10 75 25 C90 40 80 70 50 95 Z" fill="COLOR"/>
      <path d="M50 10 C35 5 25 15 25 15 C35 15 45 20 50 25 C55 20 65 15 75 15 C75 15 65 5 50 10 Z" fill="#689F38"/>
      <g fill="#FFF59D">
        <circle cx="35" cy="40" r="1.5"/><circle cx="65" cy="40" r="1.5"/>
        <circle cx="50" cy="35" r="1.5"/><circle cx="50" cy="55" r="1.5"/>
        <circle cx="38" cy="65" r="1.5"/><circle cx="62" cy="65" r="1.5"/>
        <circle cx="50" cy="75" r="1.5"/><circle cx="42" cy="50" r="1.5"/>
        <circle cx="58" cy="50" r="1.5"/>
      </g>
    </g>`,
  donut: `
    <g>
      <circle cx="50" cy="50" r="42" fill="#F4A460"/>
      <path d="M10 50 C10 28 28 10 50 10 C72 10 90 28 90 50 C90 62 82 72 72 70 C65 68 62 75 50 75 C42 75 35 68 28 72 C18 76 10 65 10 50 Z M50 35 A15 15 0 1 0 50.1 35 Z" fill="COLOR" fill-rule="evenodd"/>
      <circle cx="50" cy="50" r="15" fill="#F4A460"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
      <g stroke="#FFFFFF" stroke-width="3" stroke-linecap="round">
        <line x1="28" y1="35" x2="35" y2="28"/><line x1="72" y1="35" x2="65" y2="28"/>
        <line x1="40" y1="20" x2="48" y2="20"/><line x1="60" y1="60" x2="68" y2="55"/>
        <line x1="25" y1="55" x2="28" y2="62"/>
      </g>
    </g>`,
  pizza: `
    <g>
      <path d="M12 25 C45 8 92 35 92 35 L48 95 Z" fill="#E6A15C"/>
      <path d="M22 32 C50 18 80 38 80 38 L48 88 Z" fill="COLOR"/>
      <g fill="#E53935">
        <circle cx="45" cy="45" r="6"/><circle cx="65" cy="50" r="5.5"/>
        <circle cx="50" cy="65" r="5"/><circle cx="70" cy="65" r="4.5"/>
        <circle cx="55" cy="78" r="4"/><circle cx="35" cy="55" r="4"/>
      </g>
      <g fill="#FFF59D" opacity="0.8">
        <rect x="40" y="55" width="8" height="3" rx="1" transform="rotate(45 40 55)"/>
        <rect x="60" y="45" width="7" height="3" rx="1" transform="rotate(-30 60 45)"/>
        <rect x="52" y="70" width="6" height="3" rx="1" transform="rotate(15 52 70)"/>
      </g>
    </g>`,
  corn: `
    <g>
      <path d="M50 15 C35 30 25 60 30 90 C50 95 70 95 70 90 C75 60 65 30 50 15 Z" fill="COLOR"/>
      <g stroke="rgba(0,0,0,0.15)" stroke-width="2" fill="none">
        <line x1="38" y1="25" x2="38" y2="88"/><line x1="46" y1="20" x2="46" y2="92"/>
        <line x1="54" y1="20" x2="54" y2="92"/><line x1="62" y1="25" x2="62" y2="88"/>
        <path d="M28 40 Q50 45 72 40"/><path d="M26 55 Q50 60 74 55"/>
        <path d="M27 70 Q50 75 73 70"/><path d="M29 82 Q50 85 71 82"/>
      </g>
      <path d="M50 95 C25 90 10 60 15 35 C20 65 40 85 50 95 Z" fill="#8BC34A"/>
      <path d="M50 95 C75 90 90 60 85 35 C80 65 60 85 50 95 Z" fill="#689F38"/>
    </g>`,
  mushroom: `
    <g>
      <path d="M40 50 L40 85 C40 92 60 92 60 85 L60 50 Z" fill="#F5F5DC"/>
      <path d="M10 50 C10 15 90 15 90 50 Z" fill="COLOR"/>
      <g fill="#FFFFFF">
        <circle cx="35" cy="35" r="6"/><circle cx="65" cy="35" r="7"/>
        <circle cx="50" cy="25" r="5"/><circle cx="20" cy="45" r="4"/>
        <circle cx="80" cy="45" r="4.5"/><circle cx="50" cy="42" r="6"/>
      </g>
    </g>`,
  pineapple: `
    <g>
      <path d="M50 35 C25 35 20 65 30 85 C40 95 60 95 70 85 C80 65 75 35 50 35 Z" fill="COLOR"/>
      <g stroke="rgba(0,0,0,0.15)" stroke-width="2" fill="none">
        <line x1="25" y1="50" x2="65" y2="90"/><line x1="22" y1="65" x2="50" y2="93"/>
        <line x1="35" y1="38" x2="75" y2="78"/><line x1="75" y1="50" x2="35" y2="90"/>
        <line x1="78" y1="65" x2="50" y2="93"/><line x1="65" y1="38" x2="25" y2="78"/>
      </g>
      <g fill="#4CAF50">
        <path d="M50 35 Q35 15 20 20 Q35 25 45 35 Z"/>
        <path d="M50 35 Q65 15 80 20 Q65 25 55 35 Z"/>
        <path d="M50 35 Q40 5 50 5 Q60 5 50 35 Z"/>
        <path d="M48 35 Q30 10 35 5 Q45 15 50 35 Z"/>
        <path d="M52 35 Q70 10 65 5 Q55 15 50 35 Z"/>
      </g>
    </g>`,
  orange: `
    <g>
      <circle cx="50" cy="55" r="40" fill="COLOR"/>
      <g fill="rgba(0,0,0,0.08)">
        <circle cx="35" cy="40" r="1.5"/><circle cx="45" cy="35" r="1.5"/>
        <circle cx="55" cy="38" r="1.5"/><circle cx="65" cy="45" r="1.5"/>
        <circle cx="30" cy="55" r="1.5"/><circle cx="70" cy="55" r="1.5"/>
        <circle cx="40" cy="65" r="1.5"/><circle cx="50" cy="70" r="1.5"/>
        <circle cx="60" cy="65" r="1.5"/>
      </g>
      <path d="M50 15 C52 5 60 5 60 5" stroke="#795548" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M50 15 C65 5 85 10 75 25 C65 40 45 30 50 15 Z" fill="#689F38"/>
      <path d="M25 45 A 25 25 0 0 1 45 25" stroke="rgba(255,255,255,0.3)" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>`,
  icecream: `
    <g>
      <path d="M25 50 L75 50 L50 95 Z" fill="#FFCA28"/>
      <g stroke="#FFA000" stroke-width="2.5" opacity="0.6">
        <line x1="32" y1="50" x2="52" y2="85"/><line x1="42" y1="50" x2="57" y2="76"/>
        <line x1="52" y1="50" x2="62" y2="67"/><line x1="68" y1="50" x2="48" y2="85"/>
        <line x1="58" y1="50" x2="43" y2="76"/><line x1="48" y1="50" x2="38" y2="67"/>
      </g>
      <path d="M22 52 C15 52 15 42 22 42 C22 20 40 5 50 5 C60 5 78 20 78 42 C85 42 85 52 78 52 C70 52 65 57 55 52 C50 50 50 50 45 52 C35 57 30 52 22 52 Z" fill="COLOR"/>
      <path d="M35 15 A 20 20 0 0 1 55 10" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>`,
  cupcake: `
    <g>
      <path d="M28 55 L72 55 L62 95 L38 95 Z" fill="#B0BEC5"/>
      <path d="M33 55 L40 95 M43 55 L48 95 M57 55 L52 95 M67 55 L60 95" stroke="#90A4AE" stroke-width="2.5"/>
      <path d="M24 55 C24 35 35 25 50 15 C65 25 76 35 76 55 C70 60 65 55 50 55 C35 55 30 60 24 55 Z" fill="COLOR"/>
      <path d="M26 45 C40 40 60 50 74 45" stroke="rgba(0,0,0,0.1)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="12" r="8" fill="#E53935"/>
      <path d="M50 4 Q55 -2 60 2" stroke="#795548" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>`,
  avocado: `
    <g>
      <path d="M50 10 C30 10 20 40 20 65 C20 85 35 95 50 95 C65 95 80 85 80 65 C80 40 70 10 50 10 Z" fill="#2E7D32"/>
      <path d="M50 15 C35 15 25 42 25 65 C25 81 37 90 50 90 C63 90 75 81 75 65 C75 42 65 15 50 15 Z" fill="COLOR"/>
      <circle cx="50" cy="65" r="16" fill="#795548"/>
      <path d="M43 56 A 8 8 0 0 1 52 54" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>`,
  lemon: `
    <g>
      <path d="M85 15 C90 10 95 20 90 25 C80 40 85 60 70 75 C55 90 35 85 20 95 C15 100 5 90 10 85 C20 70 15 50 30 35 C45 20 65 25 85 15 Z" fill="COLOR"/>
      <path d="M25 45 C35 30 55 20 75 30" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M30 30 C30 15 45 5 55 5 C45 15 40 25 30 30 Z" fill="#689F38"/>
    </g>`,
  eggplant: `
    <g>
      <path d="M50 30 C20 30 20 60 20 75 C20 90 35 95 50 95 C75 95 80 70 80 50 C80 30 65 30 50 30 Z" fill="COLOR"/>
      <path d="M45 5 Q50 0 55 5 L60 20 L70 25 L65 35 L55 35 L50 45 L45 35 L35 35 L30 25 L40 20 Z" fill="#689F38"/>
      <path d="M50 5 V 20" stroke="#4CAF50" stroke-width="3" stroke-linecap="round"/>
      <path d="M30 65 A 25 25 0 0 0 50 85" stroke="rgba(255,255,255,0.2)" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>`,
  pear: `
    <g>
      <path d="M50 95 C25 95 15 70 25 50 C30 40 35 25 40 15 C45 5 55 5 60 15 C65 25 70 40 75 50 C85 70 75 95 50 95 Z" fill="COLOR"/>
      <path d="M50 10 C48 0 55 -5 60 5" stroke="#795548" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M60 5 C70 5 75 15 70 25 C60 20 55 10 60 5 Z" fill="#8BC34A"/>
      <path d="M32 65 A 20 20 0 0 0 45 85" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>`,
  pomegranate: `
    <g>
      <circle cx="50" cy="55" r="40" fill="COLOR"/>
      <path d="M35 20 L30 5 L40 15 L50 5 L60 15 L70 5 L65 20 Z" fill="COLOR"/>
      <path d="M35 20 L70 20" stroke="rgba(0,0,0,0.2)" stroke-width="3" stroke-linecap="round"/>
      <g fill="rgba(255,255,255,0.3)">
        <circle cx="35" cy="45" r="2"/><circle cx="42" cy="40" r="2.5"/>
        <circle cx="50" cy="42" r="2"/><circle cx="58" cy="48" r="2.5"/>
      </g>
      <path d="M25 50 A 25 25 0 0 0 45 85" stroke="rgba(255,255,255,0.25)" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>`
};

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