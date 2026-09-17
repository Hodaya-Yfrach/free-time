// ============================================================================
//  ShapesGame.jsx — משחק הצורות
//  ----------------------------------------------------------------------
//  לוגיקת המשחק היחידה שנמצאת כאן: איזו שאלה מוצגת וטיימר השאלה.
//  ניקוד, שלבים, כישלון והשהיה — הכול מגיע מ-useGameEngine.
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import Shape from './Shape.jsx';
import { buildQuestion } from './questions.js';

export default function ShapesGame({ engine }) {
  const { config, frozen, roundKey, registerSuccess, registerFailure } = engine;

  const [question, setQuestion] = useState(() => buildQuestion(config));
  const [msLeft, setMsLeft] = useState(config.questionMs);
  const deadlineRef = useRef(0);

  // שאלה חדשה בכל פעם ש-roundKey משתנה (תשובה נכונה / טעות / עליית שלב)
  useEffect(() => {
    setQuestion(buildQuestion(config));
    setMsLeft(config.questionMs);
    deadlineRef.current = performance.now() + config.questionMs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey]);

  // טיימר השאלה. בזמן הקפאה הדדליין נדחה קדימה כדי לא "לגנוב" זמן.
  useEffect(() => {
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const delta = now - last;
      last = now;

      if (frozen) {
        deadlineRef.current += delta; // הקפאה אמיתית של הטיימר
      } else {
        const remaining = deadlineRef.current - now;
        setMsLeft(Math.max(0, remaining));
        if (remaining <= 0) {
          registerFailure(); // נגמר הזמן = טעות
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frozen, roundKey, registerFailure]);

  function handlePick(key) {
    if (frozen) return;
    if (key === question.correctKey) {
      // יחס המהירות: 1 = ענית מיד, 0 = ברגע האחרון
      registerSuccess(msLeft / config.questionMs);
    } else {
      registerFailure();
    }
  }

  const seconds = (msLeft / 1000).toFixed(1);
  const urgent = msLeft < config.questionMs * 0.3;

  return (
    <div className="shapes-game">
      <div className={`question-clock${urgent ? ' question-clock--urgent' : ''}`}>
        ⏳ {seconds} שניות
      </div>

      <h2 className="question-title">{question.title}</h2>

      {/* ------------------------------------------------ מצב: מה חסר */}
      {question.mode === 'findMissing' && (
        <div className="find-missing">
          <div className="shape-grid">
            {question.full.map((item) => (
              <button
                key={item.key}
                className="shape-cell"
                onClick={() => handlePick(item.key)}
                aria-label={`בחירת ${item.type}`}
              >
                <Shape item={item} size={58} />
              </button>
            ))}
          </div>

          <div className="grid-divider">הלוח התחתון — אחד חסר</div>

          <div className="shape-grid shape-grid--static">
            {question.partial.map((item) => (
              <div key={item.key} className="shape-cell shape-cell--static">
                <Shape item={item} size={58} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------- מצבים: התאמת קטגוריה / התאמת צללית */}
      {question.mode !== 'findMissing' && (
        <div className="match-layout">
          <div className="target-wrap">
            <Shape item={question.target} size={110} />
          </div>

          <div className="options-row">
            {question.options.map((item) => (
              <button
                key={item.key}
                className="shape-cell shape-cell--option"
                onClick={() => handlePick(item.key)}
                aria-label={`בחירת ${item.type}`}
              >
                <Shape item={item} size={70} shadow={!!item.shadow} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
