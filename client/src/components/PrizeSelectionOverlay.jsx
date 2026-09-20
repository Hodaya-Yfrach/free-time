// ============================================================================
//  PrizeSelectionOverlay.jsx — "בחרי פרס" (נפתח כל 3 מדליות)
//  ----------------------------------------------------------------------
//  מציג 3 אפשרויות פרס. אחת מהן היא תמיד "דילוג לשלב הבא" - מוגבלת
//  ל-2 שימושים לכל משתמש/ת בסך הכול. לפני מימוש הדילוג מוצגת אזהרה
//  מפורשת (warning מגיע מתוך shared/prizes.js) שדורשת אישור.
// ============================================================================

import { useState } from 'react';

export default function PrizeSelectionOverlay({ engine }) {
  const { prizeSelection, choosePrize, skipUsesLeft } = engine;
  const [pendingSkip, setPendingSkip] = useState(null);

  if (!prizeSelection) return null;

  function handlePick(prize) {
    if (prize.kind === 'skip') {
      if (skipUsesLeft <= 0) return;
      setPendingSkip(prize); // מציגים אזהרה לפני שמאשרים בפועל
      return;
    }
    choosePrize(prize);
  }

  return (
    <div className="overlay overlay--dialog">
      <div className="panel panel--dialog panel--prize">
        <div className="panel__icon">🎁</div>
        <h2>בחרי פרס!</h2>
        <p>צברת 3 מדליות - בחרי אחד מהפרסים הבאים:</p>

        <div className="prize-options">
          {prizeSelection.options.map((prize) => {
            const disabledSkip = prize.kind === 'skip' && skipUsesLeft <= 0;
            return (
              <button
                key={prize.id}
                type="button"
                className="prize-option"
                disabled={disabledSkip}
                onClick={() => handlePick(prize)}
              >
                <span className="prize-option__icon">{prize.icon}</span>
                <span className="prize-option__label">{prize.label}</span>
                {prize.description && (
                  <span className="prize-option__desc">{prize.description}</span>
                )}
                {prize.kind === 'skip' && (
                  <span className="prize-option__meta">
                    {disabledSkip ? 'נוצל עד הסוף' : `נותרו ${skipUsesLeft} שימושים`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {pendingSkip && (
          <div className="prize-confirm">
            <p>⚠️ {pendingSkip.warning}</p>
            <div className="panel__actions">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => { choosePrize(pendingSkip); setPendingSkip(null); }}
              >
                כן, לדלג לשלב הבא
              </button>
              <button type="button" className="btn btn--quiet" onClick={() => setPendingSkip(null)}>
                ביטול
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
