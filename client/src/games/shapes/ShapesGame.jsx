// ============================================================================
//  ShapesGame.jsx — משחק הצורות
<<<<<<< HEAD
//  ----------------------------------------------------------------------
//  לוגיקת המשחק היחידה שנמצאת כאן: איזו שאלה מוצגת וטיימר השאלה.
//  ניקוד, שלבים, כישלון והשהיה — הכול מגיע מ-useGameEngine.
=======
>>>>>>> upgrade-v3
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import Shape from './Shape.jsx';
import { buildQuestion } from './questions.js';
<<<<<<< HEAD

export default function ShapesGame({ engine }) {
  const { config, frozen, roundKey, registerSuccess, registerFailure } = engine;

  const [question, setQuestion] = useState(() => buildQuestion(config));
  const [msLeft, setMsLeft] = useState(config.questionMs);
  const deadlineRef = useRef(0);

  // שאלה חדשה בכל פעם ש-roundKey משתנה (תשובה נכונה / טעות / עליית שלב)
  useEffect(() => {
    setQuestion(buildQuestion(config));
    setMsLeft(config.questionMs);
=======
import { shuffle } from './shapeData.js';

export default function ShapesGame({ engine }) {
  const { config, frozen, roundKey, registerSuccess, registerFailure, refreshRound, powerHandlerRef } = engine;

  const [question, setQuestion] = useState(() => buildQuestion(config));
  const [msLeft, setMsLeft] = useState(config.questionMs);
  const [hiddenKeys, setHiddenKeys] = useState([]);
  const [hintOn, setHintOn] = useState(false);
  const [revealOn, setRevealOn] = useState(false);
  const [freezeLeft, setFreezeLeft] = useState(0);
  
  const deadlineRef = useRef(0);
  const freezeRef = useRef(0);
  const timersRef = useRef([]);

  // שאלה חדשה בכל פעם ש-roundKey משתנה
  useEffect(() => {
    setQuestion(buildQuestion(config));
    setMsLeft(config.questionMs);
    setHiddenKeys([]);
    setHintOn(false);
    setRevealOn(false);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
>>>>>>> upgrade-v3
    deadlineRef.current = performance.now() + config.questionMs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey]);

<<<<<<< HEAD
  // טיימר השאלה. בזמן הקפאה הדדליין נדחה קדימה כדי לא "לגנוב" זמן.
  useEffect(() => {
    let raf;
    let last = performance.now();

    const tick = (now) => {
=======
  // טיימר השאלה
  useEffect(() => {
    let raf;
    let last = performance.now();
    let isFirstFrame = true;

    const tick = (now) => {
      // התיקון החשוב: השעון מתחיל לספור את הזמן *רק* כשהמסך באמת נטען ומוצג!
      // זה מונע את הפסילות המעצבנות שקרו בגלל טעינה.
      if (isFirstFrame) {
        last = now;
        deadlineRef.current = now + config.questionMs;
        isFirstFrame = false;
      }

>>>>>>> upgrade-v3
      const delta = now - last;
      last = now;

      if (frozen) {
        deadlineRef.current += delta; // הקפאה אמיתית של הטיימר
<<<<<<< HEAD
=======
      } else if (freezeRef.current > 0) {
        freezeRef.current = Math.max(0, freezeRef.current - delta);
        deadlineRef.current += delta;
        setFreezeLeft(freezeRef.current);
>>>>>>> upgrade-v3
      } else {
        const remaining = deadlineRef.current - now;
        setMsLeft(Math.max(0, remaining));
        if (remaining <= 0) {
<<<<<<< HEAD
          registerFailure(); // נגמר הזמן = טעות
=======
          if (!registerFailure({ grace: false })) refreshRound(); 
>>>>>>> upgrade-v3
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
<<<<<<< HEAD
  }, [frozen, roundKey, registerFailure]);
=======
  }, [frozen, roundKey, registerFailure, refreshRound, config.questionMs]);
>>>>>>> upgrade-v3

  function handlePick(key) {
    if (frozen) return;
    if (key === question.correctKey) {
<<<<<<< HEAD
      // יחס המהירות: 1 = ענית מיד, 0 = ברגע האחרון
      registerSuccess(msLeft / config.questionMs);
    } else {
      registerFailure();
    }
  }

=======
      registerSuccess(msLeft / config.questionMs);
    } else if (!registerFailure({ grace: false })) {
      setHiddenKeys((keys) => [...keys, key]);
    }
  }

  function scheduleOff(setter, seconds) {
    const id = setTimeout(() => setter(false), seconds * 1000);
    timersRef.current.push(id);
  }

  useEffect(() => {
    powerHandlerRef.current = (item) => {
      const seconds = item.params?.seconds || 0;
      const keys = (question.mode === 'findMissing' ? question.full : question.options).map((o) => o.key);

      if (item.effect === 'fifty_fifty') {
        const wrong = keys.filter((k) => k !== question.correctKey && !hiddenKeys.includes(k));
        if (wrong.length < 2) return false;
        const removed = shuffle(wrong).slice(0, Math.floor(wrong.length / 2));
        setHiddenKeys((current) => [...current, ...removed]);
        return true;
      }

      if (item.effect === 'hint') {
        if (hintOn) return false;
        setHintOn(true);
        scheduleOff(setHintOn, 1.8);
        return true;
      }

      if (item.effect === 'time_plus') {
        deadlineRef.current += seconds * 1000;
        return true;
      }

      if (item.effect === 'freeze_time') {
        freezeRef.current = seconds * 1000;
        return true;
      }

      if (item.effect === 'reveal_shadow') {
        if (question.mode !== 'matchShadow' || revealOn) return false;
        setRevealOn(true);
        scheduleOff(setRevealOn, seconds);
        return true;
      }

      if (item.effect === 'reroll') {
        refreshRound();
        return true;
      }

      if (item.effect === 'auto_solve') {
        registerSuccess(0.3);
        return true;
      }

      return false;
    };
  });

  function cellClass(base, key) {
    let cls = base;
    if (hiddenKeys.includes(key)) cls += ' shape-cell--hidden';
    if (hintOn && key === question.correctKey) cls += ' shape-cell--hint';
    return cls;
  }

>>>>>>> upgrade-v3
  const seconds = (msLeft / 1000).toFixed(1);
  const urgent = msLeft < config.questionMs * 0.3;

  return (
    <div className="shapes-game">
      <div className={`question-clock${urgent ? ' question-clock--urgent' : ''}`}>
<<<<<<< HEAD
        ⏳ {seconds} שניות
=======
        {seconds} שניות{freezeLeft > 0 && ' ❄️ מוקפא'}
>>>>>>> upgrade-v3
      </div>

      <h2 className="question-title">{question.title}</h2>

<<<<<<< HEAD
      {/* ------------------------------------------------ מצב: מה חסר */}
=======
>>>>>>> upgrade-v3
      {question.mode === 'findMissing' && (
        <div className="find-missing">
          <div className="shape-grid">
            {question.full.map((item) => (
              <button
                key={item.key}
<<<<<<< HEAD
                className="shape-cell"
=======
                className={cellClass('shape-cell', item.key)}
>>>>>>> upgrade-v3
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

<<<<<<< HEAD
      {/* ------------------------- מצבים: התאמת קטגוריה / התאמת צללית */}
=======
>>>>>>> upgrade-v3
      {question.mode !== 'findMissing' && (
        <div className="match-layout">
          <div className="target-wrap">
            <Shape item={question.target} size={110} />
          </div>

          <div className="options-row">
            {question.options.map((item) => (
              <button
                key={item.key}
<<<<<<< HEAD
                className="shape-cell shape-cell--option"
                onClick={() => handlePick(item.key)}
                aria-label={`בחירת ${item.type}`}
              >
                <Shape item={item} size={70} shadow={!!item.shadow} />
=======
                className={cellClass('shape-cell shape-cell--option', item.key)}
                onClick={() => handlePick(item.key)}
                aria-label={`בחירת ${item.type}`}
              >
                <Shape item={item} size={70} shadow={!!item.shadow && !revealOn} />
>>>>>>> upgrade-v3
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
