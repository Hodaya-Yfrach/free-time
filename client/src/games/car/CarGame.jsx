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

// מספר הנתיבים כבר לא קבוע - הוא מגיע מ-config.lanes ועולה עם השלב (עד 6, ר' scoring.js).
const BASE_SPEED = 150;       // פיקסלים לשנייה בשלב 1 (הואט קצת - היה 190, הרגיש לא יציב)
const CAR_WIDTH = 46;
const CAR_HEIGHT = 70;
const OBSTACLE_HEIGHT = 18;   // אורך מכשול קטן יותר כדי לא לחסום את המכשיר כולו
const ROW_GAP = CAR_HEIGHT + 24; // רווח של מכונית שלמה בין קבוצות מכשולים
const VEHICLE_GAP = CAR_HEIGHT * 2; // מרחק מינימלי של 2 רכבים בין מכשולים בגובה
const TOP_SPAWN_MARGIN = 180;  // לא נייצר שורה חדשה כשהיא עדיין כמעט נראית בתחילת המסך
const OFFSCREEN_CLEANUP = 900; // שומרים את המכשולים על המסך הרבה יותר זמן כדי שלא ייעלמו ב"גל" כל כמה שניות
const MIN_VISIBLE_OBSTACLES = 8; // לא נותנים למסך להתרוקן לגמרי
const STEER_SPEED = 620;      // כמה מהר המכונית מחליקה לעבר היעד

export default function CarGame({ engine }) {
  const {
    config, frozen, roundKey, registerSuccess, registerFailure, ownedPrizes,
    powerHandlerRef, shieldsRef, shieldGraceUntilRef,
  } = engine;

  // הפרס העיצובי האחרון שנרכש עבור המכונית (אם נרכש) - צבע/דגם חלופי
  const equippedRef = useRef(null);
  useEffect(() => {
    const carPrizes = (ownedPrizes || []).filter((p) => p.appliesTo === 'car');
    equippedRef.current = carPrizes.length ? carPrizes[carPrizes.length - 1] : null;
  }, [ownedPrizes]);

  // כל מצב המשחק יושב ב-ref: הוא משתנה 60 פעמים בשנייה
  // ואין שום סיבה לגרום ל-React לרנדר מחדש בכל פריים.
  const world = useRef({
    carX: 0.5,        // מיקום יחסי (0..1) כדי לשרוד שינוי גודל חלון
    targetX: 0.5,
    obstacles: [],
    spawnTimer: 0,
    nextSpawnY: -200,
    roadOffset: 0,
    started: false,
    fx: { slow: 0, freeze: 0, ghost: 0, mini: 0, sport: 0, gps: 0 },
  });

  const frozenRef = useRef(frozen);
  const configRef = useRef(config);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);
  useEffect(() => { configRef.current = config; }, [config]);

  // התחלת סיבוב חדש: מנקים את הכביש ומחזירים את המכונית למרכז
  useEffect(() => {
    world.current.obstacles = [];
    world.current.spawnTimer = 0.6;
    world.current.nextSpawnY = -200;
    world.current.carX = 0.5;
    world.current.targetX = 0.5;
  }, [roundKey]);

  const { canvasRef, sizeRef } = useCanvasStage((ctx, size, dt) => {
    const { width, height } = size;
    if (!width || !height) return;

    const w = world.current;
    const cfg = configRef.current;
    const speedMultiplier = w.fx.freeze > 0 ? 0 : w.fx.slow > 0 ? 0.5 : 1;
    const speed = BASE_SPEED * cfg.speedFactor * speedMultiplier;
    const carWidth = CAR_WIDTH * (w.fx.mini > 0 ? 0.5 : 1);

    // ---------------------------------------------------------- עדכון מצב
    if (!frozenRef.current) {
      for (const key of Object.keys(w.fx)) {
        if (w.fx[key] > 0) w.fx[key] = Math.max(0, w.fx[key] - dt);
      }
      w.roadOffset = (w.roadOffset + speed * dt) % 60;

      // החלקה לעבר היעד שנקבע בלחיצה
      const targetPx = w.targetX * width;
      const carPx = w.carX * width;
      const diff = targetPx - carPx;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), STEER_SPEED * (w.fx.sport > 0 ? 1.8 : 1) * dt);
      w.carX = (carPx + step) / width;

      // הולדת שורת מכשולים חדשה
      w.spawnTimer -= dt;
      if (w.spawnTimer <= 0 && w.obstacles.length < MAX_OBJECTS_ON_SCREEN + 5) {
        const minActiveY = w.obstacles.length
          ? Math.min(...w.obstacles.map((o) => o.y))
          : Infinity;

        // רק כאשר השורה העליונה כבר יצאה מהאזור העליון, נייצר את הבאה
        if (w.obstacles.length === 0 || minActiveY > -TOP_SPAWN_MARGIN) {
          spawnRow(w, cfg);
          w.spawnTimer = Math.max(0.32, 0.95 - (cfg.level - 1) * 0.04);
        } else {
          w.spawnTimer = 0.1;
        }
      }

      const carTop = height - 40 - CAR_HEIGHT;
      const carBottom = height - 40;
      const carLeft = w.carX * width - carWidth / 2;
      const carRight = carLeft + carWidth;

      for (const obs of w.obstacles) {
        obs.y += speed * dt;

        const obsLeft = obs.lane * (width / cfg.lanes) + 6;
        const obsRight = obsLeft + width / cfg.lanes - 12;

        // התנגשות
        const overlapX = carRight > obsLeft && carLeft < obsRight;
        const overlapY = carBottom > obs.y && carTop < obs.y + obs.height;
        if (overlapX && overlapY && w.fx.ghost <= 0 && !obs.scored) {
          if (registerFailure()) return;
          obs.scored = true;
          obs.y = height + OFFSCREEN_CLEANUP;
          continue;
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

      // מחיקת מכשולים רק כשהם עברו את תחתית המסך במרווח משמעותי, כדי לא להעלים את כל הבלוקים בבת אחת.
      w.obstacles = w.obstacles.filter((o) => o.y < height + OFFSCREEN_CLEANUP);

      // אם המסך התרוקן מדי, מחזירים שורות חדשות מיד כדי לשמור על מכשולים פעילים.
      if (w.obstacles.length < MIN_VISIBLE_OBSTACLES) {
        while (w.obstacles.length < MIN_VISIBLE_OBSTACLES && w.obstacles.length < MAX_OBJECTS_ON_SCREEN + 8) {
          spawnRow(w, cfg);
        }
      }
    }

    // ------------------------------------------------------------- ציור
    drawRoad(ctx, width, height, w.roadOffset, cfg.lanes);

    if (w.fx.gps > 0) drawSafeLane(ctx, width, height, w.obstacles, cfg.lanes);

    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const obs of w.obstacles) {
      const laneWidth = width / cfg.lanes;
      const x = obs.lane * laneWidth + 6;
      const cellWidth = laneWidth - 12;

      ctx.fillStyle = '#ef4444';
      roundRect(ctx, x, obs.y, cellWidth, obs.height, 10);
      ctx.fill();

      ctx.fillText('🚧', x + cellWidth / 2, obs.y + obs.height / 2);
    }

    // המכונית - כולל "פרס" עיצובי אם נרכש (הילת צבע + אמוג'י חלופי)
    const carCx = w.carX * width;
    const carCy = height - 40 - CAR_HEIGHT / 2;
    const equipped = equippedRef.current;

    if (equipped?.value?.color) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = equipped.value.color;
      ctx.beginPath();
      ctx.arc(carCx, carCy, CAR_HEIGHT * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (shieldsRef.current > 0 || performance.now() < shieldGraceUntilRef.current) {
      ctx.strokeStyle = 'rgba(96,165,250,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(carCx, carCy, CAR_HEIGHT * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.globalAlpha = w.fx.ghost > 0 ? 0.5 : 1;
    ctx.font = `${CAR_HEIGHT * (w.fx.mini > 0 ? 0.5 : 1)}px serif`;
    ctx.fillText(equipped?.value?.emoji || '🚗', carCx, carCy);
    ctx.restore();

    drawEffects(ctx, w.fx);

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

  useEffect(() => {
    powerHandlerRef.current = (item) => {
      const w = world.current;
      const seconds = item.params?.seconds || 0;

      if (item.effect === 'slow_road') { w.fx.slow = seconds; return true; }
      if (item.effect === 'freeze_road') { w.fx.freeze = seconds; return true; }
      if (item.effect === 'ghost_car') { w.fx.ghost = seconds; return true; }
      if (item.effect === 'mini_car') { w.fx.mini = seconds; return true; }
      if (item.effect === 'sport_steer') { w.fx.sport = seconds; return true; }
      if (item.effect === 'gps') { w.fx.gps = seconds; return true; }

      if (item.effect === 'sweeper') {
        const carBottomY = sizeRef.current.height - 40;
        const before = w.obstacles.length;
        w.obstacles = w.obstacles.filter((o) => o.y + o.height <= 0 || o.y >= carBottomY);
        return w.obstacles.length < before;
      }

      return false;
    };
  });

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

/**
 * שורת מכשולים: כל הנתיבים חסומים חוץ ממינימום נתיב אחד פנוי.
 * config.lanes = כמות הנתיבים הכוללת בשלב הנוכחי (עד 6).
 * config.blockedLanes = כמה מהם חסומים בו-זמנית בשורה הזו (עד 3) —
 * כך תמיד יישאר מספיק מקום לתמרן, גם ברמות הקשות ביותר.
 */
function spawnRow(world, config) {
  const laneCount = config.lanes;
  const minLaneGap = 2; // רווח של 2 רכבים לפחות בין מכשולים באותה שורה
  const blocked = Math.max(1, Math.min(config.blockedLanes, laneCount - 2));
  const safeLane = Math.floor(Math.random() * laneCount);
  const allLanes = Array.from({ length: laneCount }, (_, i) => i);
  const candidateLanes = allLanes.filter((lane) => lane !== safeLane);
  const lanes = [];

  for (const lane of candidateLanes.sort(() => Math.random() - 0.5)) {
    const prev = lanes.at(-1);
    if (prev !== undefined && Math.abs(lane - prev) < minLaneGap) continue;
    lanes.push(lane);
    if (lanes.length >= blocked) break;
  }

  if (lanes.length === 0) {
    lanes.push(candidateLanes[0] ?? 0);
  }

  const rowY = world.nextSpawnY;
  const rowJitter = (Math.random() - 0.5) * 18;
  world.nextSpawnY = rowY - ROW_GAP - (Math.random() * 10);

  // שורה חדשה תמיד מתחילה מחוץ למסך במיקום יציב, בלי "קפיצה" או "עפיפה".
  const stableRowY = Math.min(rowY + rowJitter, -200);

  lanes.forEach((lane, index) => {
    world.obstacles.push({
      lane,
      y: stableRowY + (index * (OBSTACLE_HEIGHT + 6)) + (lane % 2 === 0 ? 2 : -2),
      height: OBSTACLE_HEIGHT,
      scored: false,
      // רק מכשול אחד בשורה מזכה בנקודות, כדי שהניקוד יהיה "שורה = שאלה"
      isRowLeader: index === 0,
    });
  });

  // מאט את המשך השורה הבאה כדי שלא ייווצר חפיפה אנכית, אלא מרווח של 2 רכבים לפחות
  if (world.nextSpawnY < -200) {
    world.nextSpawnY -= VEHICLE_GAP;
  }
}

const FX_ICONS = { slow: '🐌', freeze: '⏸️', ghost: '👻', mini: '🐜', sport: '🏎️', gps: '🧭' };

function drawEffects(ctx, fx) {
  ctx.save();
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  let x = 12;
  for (const [key, left] of Object.entries(fx)) {
    if (left <= 0) continue;
    ctx.fillText(`${FX_ICONS[key]} ${left.toFixed(1)}`, x, 26);
    x += 78;
  }
  ctx.restore();
}

function drawSafeLane(ctx, width, height, obstacles, laneCount) {
  const carTop = height - 40 - CAR_HEIGHT;
  const laneWidth = width / laneCount;
  let bestLane = 0;
  let bestDistance = -1;

  for (let lane = 0; lane < laneCount; lane++) {
    let nearest = Infinity;
    for (const o of obstacles) {
      if (o.lane !== lane || o.y + o.height > carTop) continue;
      nearest = Math.min(nearest, carTop - (o.y + o.height));
    }
    if (nearest > bestDistance) {
      bestDistance = nearest;
      bestLane = lane;
    }
  }

  ctx.save();
  ctx.fillStyle = 'rgba(34,197,94,0.22)';
  ctx.fillRect(bestLane * laneWidth + 6, 0, laneWidth - 12, height);
  ctx.restore();
}

/** רקע הכביש עם קווי הפרדה שזזים — זה מה שיוצר את תחושת הנסיעה */
function drawRoad(ctx, width, height, offset, laneCount) {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 4;
  ctx.setLineDash([26, 34]);
  ctx.lineDashOffset = -offset;

  for (let lane = 1; lane < laneCount; lane++) {
    const x = lane * (width / laneCount);
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
