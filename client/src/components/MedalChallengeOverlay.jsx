// ============================================================================
//  MedalChallengeOverlay.jsx — "אתגר מדליה"
//  ----------------------------------------------------------------------
//  נפתח כשעונים תוך 3 שניות, או אחרי 3 שלבים ברצף בלי אף טעות.
//  מציג חידה קשה מתוך מאגר ה-100 (shared/riddles.js) עם 20 שניות למענה.
//  תשובה נכונה בזמן = "תפסת חלק במדליה" ואולי נפתחת בחירת פרס (כל 3 מדליות).
// ============================================================================

import { useEffect, useState } from 'react';

export default function MedalChallengeOverlay({ engine }) {
  const { medalChallenge, submitMedalAnswer, medalAnswerWindowMs } = engine;
  const [msLeft, setMsLeft] = useState(medalAnswerWindowMs);

  useEffect(() => {
    if (!medalChallenge || medalChallenge.result) return;
    setMsLeft(Math.max(0, medalChallenge.deadlineAt - Date.now()));
    const id = setInterval(() => {
      const remaining = medalChallenge.deadlineAt - Date.now();
      setMsLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(id);
        submitMedalAnswer(-1); // הזמן נגמר
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medalChallenge?.riddle?.id, medalChallenge?.result]);

  if (!medalChallenge) return null;
  const { riddle, result } = medalChallenge;
  const seconds = Math.ceil(msLeft / 1000);
  const urgent = msLeft < 5000;

  return (
    <div className="overlay overlay--medal" role="alertdialog" aria-live="assertive">
      <div className="panel panel--medal">
        {!result && (
          <>
            <div className="panel__icon">🏅</div>
            <h2>אתגר מדליה!</h2>
            <p className="medal__sub">חידה קשה במיוחד - עונים תוך 20 שניות</p>

            <div className={`medal__timer${urgent ? ' medal__timer--urgent' : ''}`}>{seconds} שניות</div>

            <p className="medal__question">{riddle.question}</p>

            <div className="medal__options">
              {riddle.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn--ghost medal__option"
                  onClick={() => submitMedalAnswer(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {result === 'success' && (
          <>
            <div className="panel__icon">🥇</div>
            <h2>תפסת חלק במדליה!</h2>
            <p>כל הכבוד - ענית נכון בזמן.</p>
          </>
        )}

        {result === 'wrong' && (
          <>
            <div className="panel__icon">🤔</div>
            <h2>לא בדיוק...</h2>
            <p>לא נורא, ממשיכים במשחק כרגיל.</p>
          </>
        )}

        {result === 'timeout' && (
          <>
            <div className="panel__icon">⏰</div>
            <h2>נגמר הזמן</h2>
            <p>בפעם הבאה תפסי אותה!</p>
          </>
        )}
      </div>
    </div>
  );
}
