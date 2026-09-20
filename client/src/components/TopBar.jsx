// ============================================================================
//  TopBar.jsx — שורת הנתונים החיים מעל המשחק
//  ----------------------------------------------------------------------
//  שני תאים מודגשים בעיצוב כרטיס בלבד: הטיימר (זמן משחק פעיל) והניקוד
//  המחושב הסופי. שלב ונקודות-לשאלה מוצגים כטקסט פשוט בלי מסגרת כפתור.
//
//  תיקון חשוב: "הניקוד המחושב" הציג בעבר rating() - נוסחה שמחשבת מחדש
//  בכל רגע "נקודות-לדקה", וזה יכול *לרדת* עם הזמן גם בלי לעשות כלום לא
//  נכון (סתם כי הזמן ממשיך לרוץ) - זה בדיוק מה שנראה כ"זז אחורה" ובלבל.
//  עכשיו התא הזה מציג את points עצמו: הניקוד הסופי המצטבר, שרק עולה
//  ואף פעם לא יורד. בונוס המהירות עדיין מחושב "מאחורי הקלעים" בכל
//  הצלחה בודדת (ר' answerPoints ב-shared/scoring.js) ומתווסף ישירות
//  ל-points - כך שהתוצאה המוצגת כבר כוללת אותו, בלי צורך בנוסחה נפרדת
//  שמסתכלת אחורה על "כמה זמן עבר". rating() עדיין קיימת ומשמשת רק
//  לדירוג בלוח התוצאות (שם היא מחושבת פעם אחת בכל סנכרון, לא live).
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
      {/* --- שורת טקסט פשוטה, לא בעיצוב כפתור --- */}
      <div className="topbar__plain">
        שלב <strong>{level}</strong>
        <span className="topbar__dot">·</span>
        {level * 2} נק' לשאלה
      </div>

      {/* --- שני התאים המודגשים היחידים --- */}
      <div className="topbar__cells">
        <div className="topbar__cell">
          <span className="topbar__label">⏱ זמן משחק</span>
          <strong className="topbar__value">{formatTime(activeMs)}</strong>
        </div>

        <div className="topbar__cell topbar__cell--accent">
          <span className="topbar__label">🧮 ניקוד מחושב</span>
          <strong className="topbar__value">{points}</strong>
          <span className="topbar__note">כולל בונוס מהירות שכבר נצבר</span>
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
