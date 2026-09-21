// ============================================================================
//  PauseOverlay.jsx — מסך השהיה שאוטם את לוח המשחק
// ============================================================================

export default function PauseOverlay({ engine }) {
  if (!engine.paused) return null;

  return (
    <div className="overlay overlay--pause">
      <div className="panel">
        <div className="panel__icon">⏸</div>
        <h2>המשחק בהשהיה</h2>
        <p>לוח המשחק הוסתר והטיימר מוקפא עד שתחזרי.</p>

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
          המשך משחק
        </button>
      </div>
    </div>
  );
}