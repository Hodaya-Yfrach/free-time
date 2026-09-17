// ============================================================================
//  TopBar.jsx — הנתונים החיים של השחקנית: ניקוד, שלב, זמן ודירוג
// ============================================================================

import { rating } from '../shared/scoring.js';

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function TopBar({ engine }) {
  const { points, level, activeMs, progressInLevel } = engine;

  return (
    <div className="topbar">
      <div className="topbar__cell">
        <span className="topbar__label">ניקוד</span>
        <strong className="topbar__value">{points}</strong>
      </div>

      <div className="topbar__cell">
        <span className="topbar__label">שלב</span>
        <strong className="topbar__value">{level}</strong>
        <span className="topbar__note">{level * 2} נק' לשאלה</span>
      </div>

      <div className="topbar__cell">
        <span className="topbar__label">זמן משחק</span>
        <strong className="topbar__value">{formatTime(activeMs)}</strong>
      </div>

      <div className="topbar__cell topbar__cell--accent">
        <span className="topbar__label">דירוג</span>
        <strong className="topbar__value">{rating({ points, activeMs })}</strong>
        <span className="topbar__note">נקודות + מהירות</span>
      </div>

      {/* התקדמות בתוך השלב הנוכחי */}
      <div className="topbar__progress" aria-label="התקדמות בשלב">
        <div
          className="topbar__progress-fill"
          style={{ width: `${Math.round(progressInLevel * 100)}%` }}
        />
      </div>
    </div>
  );
}
