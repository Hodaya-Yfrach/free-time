// ============================================================================
//  CarGame.jsx — מרוץ המכשולים
//  ----------------------------------------------------------------------
//  הרעיון: המכונית נוסעת קדימה בקצב קבוע. המכשולים עצמם קבועים
//  על הכביש — מה שזז זה הכביש, ולכן הם נראים יורדים מלמעלה.
//  השחקנית מכוונת את המכונית בלחיצת עכבר: כל לחיצה קובעת לאן
//  המכונית תיסע, והיא מחליקה לשם בצורה חלקה.
//
//  ניקוד: כל שורת מכשולים שנעקפת = תשובה נכונה במנוע הניקוד,
//  עם בונוס מהירות לפי מהירות הנסיעה הנוכחית (שעולה עם השלב).
// ============================================================================

import { useEffect, useRef } from 'react';
import { useCanvasStage, roundRect } from '../useCanvasStage.js';
import { MAX_OBJECTS_ON_SCREEN } from '../../shared/scoring.js';

const LANES = 5;              // מספר הנתיבים בכביש
const BASE_SPEED = 190;       // פיקסלים לשנייה בשלב 1
const CAR_WIDTH = 46;
const CAR_HEIGHT = 70;
const STEER_SPEED = 620;      // כמה מהר המכונית מחליקה לעבר היעד

export default function CarGame({ engine }) {
  const { config, frozen, roundKey, registerSuccess, registerFailure } = engine;

  // כל מצב המשחק יושב ב-ref: הוא משתנה 60 פעמים בשנייה
  // ואין שום סיבה לגרום ל-React לרנדר מחדש בכל פריים.
  const world = useRef({
    carX: 0.5,        // מיקום יחסי (0..1) כדי לשרוד שינוי גודל חלון
    targetX: 0.5,
    obstacles: [],
    spawnTimer: 0,
    roadOffset: 0,
    started: false,
  });

  const frozenRef = useRef(frozen);
  const configRef = useRef(config);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);
  useEffect(() => { configRef.current = config; }, [config]);

  // התחלת סיבוב חדש: מנקים את הכביש ומחזירים את המכונית למרכז
  useEffect(() => {
    world.current.obstacles = [];
    world.current.spawnTimer = 0.6;
    world.current.carX = 0.5;
    world.current.targetX = 0.5;
  }, [roundKey]);

  const { canvasRef } = useCanvasStage((ctx, size, dt) => {
    const { width, height } = size;
    if (!width || !height) return;

    const w = world.current;
    const cfg = configRef.current;
    const speed = BASE_SPEED * cfg.speedFactor;

    // ---------------------------------------------------------- עדכון מצב
    if (!frozenRef.current) {
      w.roadOffset = (w.roadOffset + speed * dt) % 60;

      // החלקה לעבר היעד שנקבע בלחיצה
      const targetPx = w.targetX * width;
      const carPx = w.carX * width;
      const diff = targetPx - carPx;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), STEER_SPEED * dt);
      w.carX = (carPx + step) / width;

      // הולדת שורת מכשולים חדשה
      w.spawnTimer -= dt;
      if (w.spawnTimer <= 0 && w.obstacles.length < MAX_OBJECTS_ON_SCREEN) {
        spawnRow(w, cfg);
        // ככל שהשלב עולה, השורות צפופות יותר
        w.spawnTimer = Math.max(0.55, 1.5 - (cfg.level - 1) * 0.08);
      }

      const carTop = height - 40 - CAR_HEIGHT;
      const carBottom = height - 40;
      const carLeft = w.carX * width - CAR_WIDTH / 2;
      const carRight = carLeft + CAR_WIDTH;

      for (const obs of w.obstacles) {
        obs.y += speed * dt;

        const obsLeft = obs.lane * (width / LANES) + 6;
        const obsRight = obsLeft + width / LANES - 12;

        // התנגשות
        const overlapX = carRight > obsLeft && carLeft < obsRight;
        const overlapY = carBottom > obs.y && carTop < obs.y + obs.height;
        if (overlapX && overlapY) {
          registerFailure();
          return;
        }

        // עברנו את השורה בשלום
        if (!obs.scored && obs.y > carBottom) {
          obs.scored = true;
          if (obs.isRowLeader) {
            // בונוס מהירות לפי כמה מהר נוסעים בשלב הנוכחי
            const ratio = Math.min(1, (cfg.speedFactor - 1) / 1.5);
            registerSuccess(ratio);
          }
        }
      }

      w.obstacles = w.obstacles.filter((o) => o.y < height + 80);
    }

    // ------------------------------------------------------------- ציור
    drawRoad(ctx, width, height, w.roadOffset);

    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const obs of w.obstacles) {
      const laneWidth = width / LANES;
      const x = obs.lane * laneWidth + 6;
      const cellWidth = laneWidth - 12;

      ctx.fillStyle = '#ef4444';
      roundRect(ctx, x, obs.y, cellWidth, obs.height, 10);
      ctx.fill();

      ctx.fillText('🚧', x + cellWidth / 2, obs.y + obs.height / 2);
    }

    // המכונית
    const carCx = w.carX * width;
    const carCy = height - 40 - CAR_HEIGHT / 2;
    ctx.font = `${CAR_HEIGHT}px serif`;
    ctx.fillText('🚗', carCx, carCy);

    // קו מנחה עדין אל היעד שנבחר
    if (Math.abs(w.targetX - w.carX) > 0.01) {
      ctx.strokeStyle = 'rgba(59,130,246,0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(carCx, carCy);
      ctx.lineTo(w.targetX * width, carCy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, []);

  /** לחיצה על הכביש קובעת לאן המכונית תנוע */
  function handlePointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    world.current.targetX = Math.min(0.94, Math.max(0.06, x));
  }

  return (
    <div className="stage-wrap">
      <p className="stage-hint">לחצי עם העכבר במקום שאליו את רוצה לכוון את המכונית</p>
      <canvas
        ref={canvasRef}
        className="stage-canvas stage-canvas--road"
        onPointerDown={handlePointer}
      />
    </div>
  );
}

/** שורת מכשולים: כל הנתיבים חסומים חוץ מאחד לפחות */
function spawnRow(world, config) {
  const blocked = Math.min(config.hazards, LANES - 1);
  const lanes = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, blocked);

  lanes.forEach((lane, index) => {
    world.obstacles.push({
      lane,
      y: -70,
      height: 46,
      scored: false,
      // רק מכשול אחד בשורה מזכה בנקודות, כדי שהניקוד יהיה "שורה = שאלה"
      isRowLeader: index === 0,
    });
  });
}

/** רקע הכביש עם קווי הפרדה שזזים — זה מה שיוצר את תחושת הנסיעה */
function drawRoad(ctx, width, height, offset) {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 4;
  ctx.setLineDash([26, 34]);
  ctx.lineDashOffset = -offset;

  for (let lane = 1; lane < LANES; lane++) {
    const x = lane * (width / LANES);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // שוליים
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 5, height);
  ctx.fillRect(width - 5, 0, 5, height);
}
