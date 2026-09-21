// ============================================================================
//  PauseOverlay.jsx — מסך השהיה שאוטם את לוח המשחק
<<<<<<< HEAD
//  הסתרת הלוח היא הכוונה: אחרת אפשר היה לעצור, לפתור בנחת ולהמשיך.
=======
>>>>>>> upgrade-v3
// ============================================================================

export default function PauseOverlay({ engine }) {
  if (!engine.paused) return null;

  return (
    <div className="overlay overlay--pause">
      <div className="panel">
        <div className="panel__icon">⏸</div>
<<<<<<< HEAD
        <h2>המשחק מושהה</h2>
        <p>לוח המשחק מוסתר בזמן ההשהיה, והשעון לא סופר.</p>
=======
        <h2>המשחק בהשהיה</h2>
        <p>לוח המשחק הוסתר והטיימר מוקפא עד שתחזרי.</p>
>>>>>>> upgrade-v3

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
<<<<<<< HEAD
          חזרה למשחק
=======
          המשך משחק
>>>>>>> upgrade-v3
        </button>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
