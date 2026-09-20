// ============================================================================
//  PrizeCart.jsx — "סל הקניות": כל הפרסים שנרכשו עד עכשיו
//  מוצג בתפריט הצדדי במקום ריבוי כפתורים - רק תצוגה קטנה וברורה.
// ============================================================================

export default function PrizeCart({ prizes }) {
  if (!prizes || prizes.length === 0) return null;

  return (
    <div className="prize-cart">
      <h3 className="prize-cart__title">🎒 הפרסים שלך</h3>
      <div className="prize-cart__items">
        {prizes.map((p, i) => (
          <span key={`${p.id}-${i}`} className="prize-cart__item" title={p.label}>
            {p.icon}
          </span>
        ))}
      </div>
    </div>
  );
}
