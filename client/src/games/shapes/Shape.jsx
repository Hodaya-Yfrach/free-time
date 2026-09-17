// ============================================================================
//  Shape.jsx — רכיב תצוגה בודד לצורה
//  ה-SVG מגיע כמחרוזת ולכן משתמשים ב-dangerouslySetInnerHTML.
//  זה בטוח כאן: המחרוזות מגיעות מקובץ פנימי שלנו, לא מקלט משתמש.
// ============================================================================

import { shapeSvg } from './shapeData.js';

export default function Shape({ item, size = 60, shadow = false }) {
  const color = shadow ? '#0f172a' : item.color;
  return (
    <span
      className={shadow ? 'shape-svg shape-svg--shadow' : 'shape-svg'}
      dangerouslySetInnerHTML={{ __html: shapeSvg(item.type, color, size) }}
    />
  );
}
