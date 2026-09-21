<<<<<<< HEAD
// ============================================================================
//  FailScreen.jsx — מסך הטעות עם ספירה לאחור
//  הנקודות שנצברו נשמרות; רק ההתקדמות בתוך השלב מתאפסת.
// ============================================================================

=======
>>>>>>> upgrade-v3
export default function FailScreen({ engine }) {
  if (!engine.failed) return null;

  return (
    <div className="overlay overlay--fail">
      <div className="panel panel--fail">
        <div className="panel__icon">😢</div>
<<<<<<< HEAD
        <h2>אופס, טעית</h2>
        <p>השלב מתחיל מחדש בעוד</p>
        <div className="countdown">{engine.countdown}</div>
        <span className="panel__note">הנקודות שצברת נשמרות</span>
      </div>
    </div>
  );
}
=======
        <h2>אופס, טעות קטנה</h2>
        <p>השלב מתחיל מחדש בעוד:</p>
        <div className="countdown">{engine.countdown}</div>
        <span className="panel__note">אל דאגה, הנקודות שצברת נשמרות</span>
      </div>
    </div>
  );
}
>>>>>>> upgrade-v3
