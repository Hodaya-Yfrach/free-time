// ============================================================================
//  LevelUpOverlay.jsx — מסך עליית השלב
//  ----------------------------------------------------------------------
//  מוצג שתי שניות בכל עליית שלב, עם קונפטי על כל המסך, ומכיל:
//    • מספר השלב החדש
//    • המקום שלי מתוך כלל השחקנים בחדר
//    • שמות כל מי שעקפתי מאז עליית השלב הקודמת
//    • שלושת המובילים כרגע
//
//  הנתונים מגיעים מהשרת, כי רק לו יש את התמונה המלאה של החדר.
// ============================================================================

import Confetti from './Confetti.jsx';
import { useGame } from '../state/GameContext.jsx';

export default function LevelUpOverlay() {
  const { levelUp } = useGame();
  if (!levelUp) return null;

  const { level, place, totalPlayers, overtaken, top3 } = levelUp;

  return (
    <div className="levelup" role="status" aria-live="polite">
      <Confetti />

      <div className="levelup__content">
        <div className="levelup__badge">
          <span className="levelup__label">שלב</span>
          <span className="levelup__number">{level}</span>
        </div>

        <div className="levelup__place">
          מקום {place} מתוך {totalPlayers}
        </div>

        {overtaken.length > 0 && (
          <div className="levelup__overtaken">
            <div className="levelup__overtaken-title">
              עקפת את {overtaken.length} שחקניות
            </div>
            <div className="levelup__names">
              {overtaken.map((name) => (
                <span key={name} className="levelup__name">{name}</span>
              ))}
            </div>
          </div>
        )}

        <ol className="levelup__top3">
          {top3.map((player) => (
            <li
              key={player.place}
              className={player.isMe ? 'levelup__top3-row is-me' : 'levelup__top3-row'}
            >
              <span className="levelup__medal">
                {player.place === 1 ? '🥇' : player.place === 2 ? '🥈' : '🥉'}
              </span>
              <span className="levelup__top3-name">{player.name}</span>
              <span className="levelup__top3-score">{player.points}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
