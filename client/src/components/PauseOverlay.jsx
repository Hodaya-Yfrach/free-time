// ============================================================================
//  PauseOverlay.jsx — מסך השהיה שאוטם את לוח המשחק
//  הסתרת הלוח היא הכוונה: אחרת אפשר היה לעצור, לפתור בנחת ולהמשיך.
// ============================================================================

export default function PauseOverlay({ engine }) {
  if (!engine.paused) return null;

  return (
    <div className="overlay overlay--pause">
      <div className="panel">
        <div className="panel__icon">⏸</div>
        <h2>המשחק מושהה</h2>
        <p>לוח המשחק מוסתר בזמן ההשהיה, והשעון לא סופר.</p>

        <div className="panel__stats">
          <div>שלב נוכחי: <strong>{engine.level}</strong></div>
          <div className="progress">
            <div
              className="progress__fill"
              style={{ width: `${Math.round(engine.progressInLevel * 100)}%` }}
            />
          </div>
          <span className="progress__label">התקדמות בשלב</span>
        </div>

        <button className="btn btn--primary" onClick={engine.togglePause}>
          חזרה למשחק
        </button>
      </div>
    </div>
  );
}
