// ============================================================================
//  GamesInfo.jsx — "נתונים על המשחקים"
//  ----------------------------------------------------------------------
//  קומפוננטה נפרדת לדף הבית: מציגה טבלת/כרטיסי מידע על שלושת המשחקים -
//  איך משחקים, איך עולה הקושי, ואיך מחושב הניקוד. הנתונים נשלפים
//  מ-shared/games.js ו-shared/scoring.js כדי שיישארו מסונכרנים תמיד
//  עם המשחקים בפועל (בלי טקסט קבוע שיכול "להתיישן").
// ============================================================================

import { GAMES } from '../shared/games.js';
import { levelConfig, POINTS_STEP, LEVEL_STEP, SPEED_WEIGHT } from '../shared/scoring.js';

export default function GamesInfo() {
  return (
    <section className="lobby__section games-info">
      <h2 className="lobby__section-title">נתונים על המשחקים</h2>

      <div className="games-info__grid">
        {GAMES.map((game) => {
          const early = levelConfig(1);
          const late = levelConfig(10);
          return (
            <article key={game.id} className="games-info__card" style={{ '--accent': game.accent }}>
              <header className="games-info__head">
                <span className="games-info__icon">{game.icon}</span>
                <div>
                  <h3>{game.name}</h3>
                  <p className="games-info__tagline">{game.tagline}</p>
                </div>
              </header>

              <p className="games-info__desc">{game.description}</p>

              <dl className="games-info__stats">
                <div><dt>נקודות לתשובה נכונה בשלב 1</dt><dd>{POINTS_STEP}</dd></div>
                <div><dt>תשובות נכונות לעליית שלב</dt><dd>{LEVEL_STEP}</dd></div>
                {game.id === 'shapes' && (
                  <div><dt>צורות על המסך (שלב 1 → 10)</dt><dd>{early.objectsOnScreen} → {late.objectsOnScreen}</dd></div>
                )}
                {game.id === 'car' && (
                  <div><dt>נתיבים בכביש (שלב 1 → 10)</dt><dd>{early.lanes} → {late.lanes}</dd></div>
                )}
                {game.id === 'dollar' && (
                  <div><dt>שודדים בו-זמנית (שלב 1 → 10)</dt><dd>{early.hazards} → {late.hazards}</dd></div>
                )}
              </dl>
            </article>
          );
        })}
      </div>

      <p className="games-info__footnote">
        הדירוג הסופי בלוח התוצאות משלב נקודות וזמן משחק: כל נקודה-לדקה
        שווה פי {SPEED_WEIGHT} בדירוג, כך שמי שמשחקת מהר יותר מדורגת גבוה
        יותר גם באותו ניקוד גולמי.
      </p>
    </section>
  );
}
