// ============================================================================
//  TopBar.jsx — שורת הנתונים החיים מעל המשחק
// ============================================================================

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
      {/* --- שורת טקסט פשוטה --- */}
      <div className="topbar__plain">
        שלב <strong>{level}</strong>
        <span className="topbar__dot">·</span>
        {level * 2} נק' לשאלה
      </div>

      {/* --- שני התאים המודגשים --- */}
      <div className="topbar__cells">
        <div className="topbar__cell">
          <span className="topbar__label">⏱ זמן פעיל</span>
          <strong className="topbar__value">{formatTime(activeMs)}</strong>
        </div>

        <div className="topbar__cell topbar__cell--accent">
          <span className="topbar__label">🧮 ניקוד מחושב</span>
          <strong className="topbar__value">{points}</strong>
          <span className="topbar__note">כולל בונוס מהירות</span>
        </div>
      </div>

      {/* התקדמות בתוך השלב הנוכחי */}
      <div className="topbar__progress" aria-label="התקדמות בשלב">
        <div
          className="topbar__progress-fill"
          style={{ width: `${Math.round(Math.min(1, progressInLevel) * 100)}%` }}
        />
      </div>
    </div>
  );
}