// ============================================================================
<<<<<<< HEAD
//  CarGame.jsx — מרוץ המכשולים
//  ----------------------------------------------------------------------
//  הרעיון: המכונית נוסעת קדימה בקצב קבוע. המכשולים עצמם קבועים
//  על הכביש — מה שזז זה הכביש, ולכן הם נראים יורדים מלמעלה.
//  השחקנית מכוונת את המכונית בלחיצת עכבר: כל לחיצה קובעת לאן
//  המכונית תיסע, והיא מחליקה לשם בצורה חלקה.
//
//  ניקוד: כל שורת מכשולים שנעקפת = תשובה נכונה במנוע הניקוד,
//  עם בונוס מהירות לפי מהירות הנסיעה הנוכחית (שעולה עם השלב).
=======
//  CarGame.jsx — מרוץ המכשולים (עיצוב נוף פרימיום דינאמי ויוקרתי)
>>>>>>> upgrade-v3
// ============================================================================

import { useEffect, useRef } from 'react';
import { useCanvasStage, roundRect } from '../useCanvasStage.js';
import { MAX_OBJECTS_ON_SCREEN } from '../../shared/scoring.js';

<<<<<<< HEAD
const LANES = 5;              // מספר הנתיבים בכביש
const BASE_SPEED = 190;       // פיקסלים לשנייה בשלב 1
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
  const { config, frozen, roundKey, registerSuccess, registerFailure } = engine;

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
=======
const BASE_SPEED = 185; 
const CAR_WIDTH = 62;
const CAR_HEIGHT = 82;
const OBSTACLE_HEIGHT = 18; 
const ROW_GAP = CAR_HEIGHT + 24; 
const VEHICLE_GAP = CAR_HEIGHT * 2; 
const TOP_SPAWN_MARGIN = 180;  
const OFFSCREEN_CLEANUP = 900; 
const MIN_VISIBLE_OBSTACLES = 8; 
const STEER_SPEED = 620;      
const MEDAL_GOAL = 5;
const START_GRACE_MS = 1500; // זמן "התחממות" מוחלט לפני שמתחילים לזוז/להתנגש - נספר משעון אמת, לא מ-dt מצטבר

function getRoadMetrics(width, laneCount) {
  const roadWidth = Math.min(width * 0.92, (CAR_WIDTH + 56) * laneCount);
  const left = (width - roadWidth) / 2;
  const laneWidth = roadWidth / laneCount;
  return { left, width: roadWidth, laneWidth };
}

export default function CarGame({ engine }) {
  const {
    config, frozen, roundKey, registerSuccess, registerFailure, ownedPrizes,
    powerHandlerRef, shieldsRef, shieldGraceUntilRef, collectMedal, medalRunCount,
  } = engine;

  const equippedRef = useRef(null);
  useEffect(() => {
    const carPrizes = (ownedPrizes || []).filter((p) => p.appliesTo === 'car');
    equippedRef.current = carPrizes.length ? carPrizes[carPrizes.length - 1] : null;
  }, [ownedPrizes]);

  const world = useRef({
    carX: 0.5,        
    targetX: 0.5,
    obstacles: [],
    medals: [],
    spawnTimer: 0,
    nextSpawnY: -200,
    roadOffset: 0,
    readyAt: 0, // נקבע לזמן אמת (performance.now()) ברגע שהקנבס מקבל גודל תקין בפועל
    fx: { slow: 0, freeze: 0, ghost: 0, mini: 0, sport: 0, gps: 0 },
>>>>>>> upgrade-v3
  });

  const frozenRef = useRef(frozen);
  const configRef = useRef(config);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);
  useEffect(() => { configRef.current = config; }, [config]);

<<<<<<< HEAD
  // התחלת סיבוב חדש: מנקים את הכביש ומחזירים את המכונית למרכז
  useEffect(() => {
    world.current.obstacles = [];
=======
  useEffect(() => {
    world.current.obstacles = [];
    world.current.medals = [];
>>>>>>> upgrade-v3
    world.current.spawnTimer = 0.6;
    world.current.nextSpawnY = -200;
    world.current.carX = 0.5;
    world.current.targetX = 0.5;
<<<<<<< HEAD
  }, [roundKey]);

  const { canvasRef } = useCanvasStage((ctx, size, dt) => {
=======
    world.current.readyAt = 0;
  }, [roundKey]);

  const { canvasRef, sizeRef } = useCanvasStage((ctx, size, dt) => {
>>>>>>> upgrade-v3
    const { width, height } = size;
    if (!width || !height) return;

    const w = world.current;
<<<<<<< HEAD
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
=======
    // "התחממות": ברגע הראשון שיש לקנבס גודל אמיתי (כלומר שהוא באמת עומד
    // להיראות), קובעים חלון חסינות של START_GRACE_MS לפי שעון אמת אמיתי.
    // ה-graceUntil הזה לא תלוי בכמה פריימים כבר רצו או כמה זמן "dt" נצבר -
    // רק בזמן אמת שחלף - כדי שגם אם הטעינה הראשונית איטית, החסינות תמיד
    // תכסה בפועל את הרגע שבו השחקן/ית סוף סוף רואה את הכביש.
    if (!w.readyAt) w.readyAt = performance.now() + START_GRACE_MS;
    const ready = performance.now() >= w.readyAt;

    const cfg = configRef.current;
    const road = getRoadMetrics(width, cfg.lanes);
    const speedMultiplier = w.fx.freeze > 0 ? 0 : w.fx.slow > 0 ? 0.5 : 1;
    const speed = BASE_SPEED * cfg.speedFactor * speedMultiplier;
    const carWidth = CAR_WIDTH * (w.fx.mini > 0 ? 0.5 : 1);
    const carHalfWidth = carWidth / 2;

    if (!w.medals.length || w.medals.every((m) => m.collected || m.y > height + 220)) {
      const lanes = Array.from({ length: cfg.lanes }, (_, lane) => lane);
      const medalCount = 3;
      for (let i = 0; i < medalCount; i += 1) {
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        const laneCenterX = road.left + (lane + 0.5) * road.laneWidth;
        const y = -120 - i * 170 - Math.random() * 60;
        w.medals.push({ x: laneCenterX, y, radius: 15, collected: false });
      }
    }

    if (!frozenRef.current && ready) {
      for (const key of Object.keys(w.fx)) {
        if (w.fx[key] > 0) w.fx[key] = Math.max(0, w.fx[key] - dt);
      }
      w.roadOffset = (w.roadOffset + speed * dt) % 2000; 

      const roadInset = carHalfWidth / road.width;
      const targetPx = road.left + w.targetX * road.width;
      const carPx = road.left + w.carX * road.width;
      const diff = targetPx - carPx;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), STEER_SPEED * (w.fx.sport > 0 ? 1.8 : 1) * dt);
      w.carX = (carPx + step - road.left) / road.width;
      w.targetX = Math.min(1 - roadInset, Math.max(roadInset, w.targetX));
      w.carX = Math.min(1 - roadInset, Math.max(roadInset, w.carX));

>>>>>>> upgrade-v3
      w.spawnTimer -= dt;
      if (w.spawnTimer <= 0 && w.obstacles.length < MAX_OBJECTS_ON_SCREEN + 5) {
        const minActiveY = w.obstacles.length
          ? Math.min(...w.obstacles.map((o) => o.y))
          : Infinity;

<<<<<<< HEAD
        // רק כאשר השורה העליונה כבר יצאה מהאזור העליון, נייצר את הבאה
=======
>>>>>>> upgrade-v3
        if (w.obstacles.length === 0 || minActiveY > -TOP_SPAWN_MARGIN) {
          spawnRow(w, cfg);
          w.spawnTimer = Math.max(0.32, 0.95 - (cfg.level - 1) * 0.04);
        } else {
          w.spawnTimer = 0.1;
        }
      }

      const carTop = height - 40 - CAR_HEIGHT;
      const carBottom = height - 40;
<<<<<<< HEAD
      const carLeft = w.carX * width - CAR_WIDTH / 2;
      const carRight = carLeft + CAR_WIDTH;
=======
      const carLeft = road.left + w.carX * road.width - carWidth / 2;
      const carRight = carLeft + carWidth;

      for (const medal of w.medals) {
        if (medal.collected) continue;
        medal.y += speed * dt;

        const medalCenterX = medal.x;
        const medalCenterY = medal.y;
        const medalHitX = medalCenterX >= carLeft - medal.radius && medalCenterX <= carRight + medal.radius;
        const medalHitY = medalCenterY >= carTop - medal.radius - 16 && medalCenterY <= carBottom + medal.radius + 18;
        if (medalHitX && medalHitY) {
          medal.collected = true;
          collectMedal?.();
        }
      }
      w.medals = w.medals.filter((medal) => !medal.collected && medal.y < height + 420);
>>>>>>> upgrade-v3

      for (const obs of w.obstacles) {
        obs.y += speed * dt;

<<<<<<< HEAD
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
=======
        const obsLeft = road.left + obs.lane * road.laneWidth + 6;
        const obsRight = obsLeft + road.laneWidth - 12;

        const overlapX = carRight > obsLeft && carLeft < obsRight;
        const overlapY = carBottom > obs.y && carTop < obs.y + obs.height;
        if (overlapX && overlapY && w.fx.ghost <= 0 && !obs.scored) {
          if (registerFailure()) return;
          obs.scored = true;
          obs.y = height + OFFSCREEN_CLEANUP;
          continue;
        }

        if (!obs.scored && obs.y > carBottom) {
          obs.scored = true;
          if (obs.isRowLeader) {
>>>>>>> upgrade-v3
            const ratio = Math.min(1, (cfg.speedFactor - 1) / 1.5);
            registerSuccess(ratio);
          }
        }
      }

<<<<<<< HEAD
      // מחיקת מכשולים רק כשהם עברו את תחתית המסך במרווח משמעותי, כדי לא להעלים את כל הבלוקים בבת אחת.
      w.obstacles = w.obstacles.filter((o) => o.y < height + OFFSCREEN_CLEANUP);

      // אם המסך התרוקן מדי, מחזירים שורות חדשות מיד כדי לשמור על מכשולים פעילים.
=======
      w.obstacles = w.obstacles.filter((o) => o.y < height + OFFSCREEN_CLEANUP);

>>>>>>> upgrade-v3
      if (w.obstacles.length < MIN_VISIBLE_OBSTACLES) {
        while (w.obstacles.length < MIN_VISIBLE_OBSTACLES && w.obstacles.length < MAX_OBJECTS_ON_SCREEN + 8) {
          spawnRow(w, cfg);
        }
      }
    }

<<<<<<< HEAD
    // ------------------------------------------------------------- ציור
    drawRoad(ctx, width, height, w.roadOffset);
=======
    drawRoad(ctx, width, height, w.roadOffset, cfg.lanes);

    for (const medal of w.medals) {
      if (medal.collected) continue;
      ctx.save();
      ctx.translate(medal.x, medal.y);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, medal.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(0, 0, medal.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏅', 0, 2);
      ctx.restore();
    }

    if (w.fx.gps > 0) drawSafeLane(ctx, width, height, w.obstacles, cfg.lanes);
>>>>>>> upgrade-v3

    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const obs of w.obstacles) {
<<<<<<< HEAD
      const laneWidth = width / LANES;
      const x = obs.lane * laneWidth + 6;
      const cellWidth = laneWidth - 12;

      ctx.fillStyle = '#ef4444';
=======
      const laneWidth = road.laneWidth;
      const x = road.left + obs.lane * laneWidth + 6;
      const cellWidth = laneWidth - 12;

      ctx.fillStyle = '#e11d48';
>>>>>>> upgrade-v3
      roundRect(ctx, x, obs.y, cellWidth, obs.height, 10);
      ctx.fill();

      ctx.fillText('🚧', x + cellWidth / 2, obs.y + obs.height / 2);
    }

<<<<<<< HEAD
    // המכונית
    const carCx = w.carX * width;
    const carCy = height - 40 - CAR_HEIGHT / 2;
    ctx.font = `${CAR_HEIGHT}px serif`;
    ctx.fillText('🚗', carCx, carCy);

    // קו מנחה עדין אל היעד שנבחר
    if (Math.abs(w.targetX - w.carX) > 0.01) {
      ctx.strokeStyle = 'rgba(59,130,246,0.45)';
=======
    const carCx = road.left + w.carX * road.width;
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
    ctx.fillText(equipped?.value?.emoji || '🚘', carCx, carCy);
    ctx.restore();

    drawEffects(ctx, w.fx);

    if (Math.abs(w.targetX - w.carX) > 0.01) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
>>>>>>> upgrade-v3
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(carCx, carCy);
<<<<<<< HEAD
      ctx.lineTo(w.targetX * width, carCy);
=======
      ctx.lineTo(road.left + w.targetX * road.width, carCy);
>>>>>>> upgrade-v3
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, []);

<<<<<<< HEAD
  /** לחיצה על הכביש קובעת לאן המכונית תנוע */
  function handlePointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    world.current.targetX = Math.min(0.94, Math.max(0.06, x));
=======
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

  function handlePointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const road = getRoadMetrics(rect.width, config.lanes);
    const insideRoadX = Math.min(Math.max(x, road.left), road.left + road.width);
    const relative = (insideRoadX - road.left) / road.width;
    world.current.targetX = Math.min(0.98, Math.max(0.02, relative));
>>>>>>> upgrade-v3
  }

  return (
    <div className="stage-wrap">
<<<<<<< HEAD
      <p className="stage-hint">לחצי עם העכבר במקום שאליו את רוצה לכוון את המכונית</p>
=======
      <p className="stage-hint">לחצי עם העכבר על נתיב היעד כדי לכוון את המכונית אליו. התחמקי מהמכשולים!</p>
>>>>>>> upgrade-v3
      <canvas
        ref={canvasRef}
        className="stage-canvas stage-canvas--road"
        onPointerDown={handlePointer}
      />
    </div>
  );
}

<<<<<<< HEAD
/** שורת מכשולים: כל הנתיבים חסומים חוץ מאחד לפחות */
function spawnRow(world, config) {
  const minLaneGap = 2;
  const blocked = Math.max(1, Math.min(config.hazards + 1, LANES - 2));
  const safeLane = Math.floor(Math.random() * LANES);
  const candidateLanes = [0, 1, 2, 3, 4].filter((lane) => lane !== safeLane);
=======
function spawnRow(world, config) {
  const laneCount = config.lanes;
  const minLaneGap = 2; 
  const blocked = Math.max(1, Math.min(config.blockedLanes, laneCount - 2));
  const safeLane = Math.floor(Math.random() * laneCount);
  const allLanes = Array.from({ length: laneCount }, (_, i) => i);
  const candidateLanes = allLanes.filter((lane) => lane !== safeLane);
>>>>>>> upgrade-v3
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

<<<<<<< HEAD
  // שורה חדשה תמיד מתחילה מחוץ למסך במיקום יציב, בלי "קפיצה" או "עפיפה".
=======
>>>>>>> upgrade-v3
  const stableRowY = Math.min(rowY + rowJitter, -200);

  lanes.forEach((lane, index) => {
    world.obstacles.push({
      lane,
      y: stableRowY + (index * (OBSTACLE_HEIGHT + 6)) + (lane % 2 === 0 ? 2 : -2),
      height: OBSTACLE_HEIGHT,
      scored: false,
<<<<<<< HEAD
      // רק מכשול אחד בשורה מזכה בנקודות, כדי שהניקוד יהיה "שורה = שאלה"
=======
>>>>>>> upgrade-v3
      isRowLeader: index === 0,
    });
  });

<<<<<<< HEAD
  // מאט את המשך השורה הבאה כדי שלא ייווצר חפיפה אנכית, אלא מרווח של 2 רכבים לפחות
=======
>>>>>>> upgrade-v3
  if (world.nextSpawnY < -200) {
    world.nextSpawnY -= VEHICLE_GAP;
  }
}

<<<<<<< HEAD
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
=======
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
  const road = getRoadMetrics(width, laneCount);
  const laneWidth = road.laneWidth;
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
  ctx.fillStyle = 'rgba(34,197,94,0.15)'; 
  ctx.fillRect(road.left + bestLane * laneWidth + 6, 0, laneWidth - 12, height);
  ctx.restore();
}

/** 
 * עיצוב פרימיום מרהיב לנוף הדינאמי של הכביש!
 * כולל: שמיים הדרגתיים, שמש, עננים שזזים, הרים בשכבות, אדמה עשירה וכביש מואר.
 */
function drawRoad(ctx, width, height, offset, laneCount) {
  const road = getRoadMetrics(width, laneCount);
  const horizon = height * 0.35; // קו האופק

  // 1. שמיים - גרדיאנט שקיעה/אחר הצהריים יוקרתי
  const skyGradient = ctx.createLinearGradient(0, 0, 0, horizon);
  skyGradient.addColorStop(0, '#3b82f6'); // כחול עמוק למעלה
  skyGradient.addColorStop(0.6, '#93c5fd'); // תכלת
  skyGradient.addColorStop(1, '#ffedd5'); // כתמתם-אפרסק באופק
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. שמש זוהרת
  ctx.save();
  ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; // צהוב-זהב
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.arc(width * 0.75, horizon - 40, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. עננים דינאמיים שזזים לאט בשמיים (אפקט Parallax)
  const cloudSpeed = offset * 0.03;
  drawCloud(ctx, (width * 0.15 + cloudSpeed) % (width + 150) - 75, horizon - 100, 1.2, 0.9);
  drawCloud(ctx, (width * 0.6 + cloudSpeed * 1.5) % (width + 150) - 75, horizon - 60, 0.8, 0.7);
  drawCloud(ctx, (width * 0.85 + cloudSpeed * 0.8) % (width + 150) - 75, horizon - 120, 1, 0.85);

  // 4. הרים (שכבה אחורית - רחוקה ובהירה)
  ctx.fillStyle = '#94a3b8'; // אפור-כחלחל
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.quadraticCurveTo(width * 0.2, horizon - 60, width * 0.4, horizon);
  ctx.quadraticCurveTo(width * 0.7, horizon - 80, width, horizon);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  // 5. הרים (שכבה קדמית - קרובה וכהה יותר)
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.quadraticCurveTo(width * 0.3, horizon - 40, width * 0.6, horizon + 10);
  ctx.quadraticCurveTo(width * 0.85, horizon - 50, width, horizon + 20);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  // 6. אדמה/דשא - מעבר צבע ירוק חי
  const groundGradient = ctx.createLinearGradient(0, horizon, 0, height);
  groundGradient.addColorStop(0, '#86efac'); // ירוק בהיר ליד האופק
  groundGradient.addColorStop(1, '#15803d'); // ירוק כהה קרוב למסך
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, horizon, width, height - horizon);

  // 7. שולי הכביש (מדרכות עפר/כורכר)
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(road.left - 16, 0, 16, height);
  ctx.fillRect(road.left + road.width, 0, 16, height);

  // 8. הכביש הראשי - גרדיאנט רוחבי שנותן אשליית תאורה ונפח
  const roadGradient = ctx.createLinearGradient(road.left, 0, road.left + road.width, 0);
  roadGradient.addColorStop(0, '#0f172a');   // כהה בשוליים
  roadGradient.addColorStop(0.5, '#334155'); // מעט מואר באמצע
  roadGradient.addColorStop(1, '#0f172a');   // כהה בשוליים
  ctx.fillStyle = roadGradient;
  ctx.fillRect(road.left, 0, road.width, height);

  // 9. קווי הפרדה מקווקווים (יוצרים את אשליית המהירות)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 4;
  ctx.setLineDash([30, 40]);
  ctx.lineDashOffset = -(offset % 70); 

  for (let lane = 1; lane < laneCount; lane++) {
    const x = road.left + lane * road.laneWidth;
>>>>>>> upgrade-v3
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
<<<<<<< HEAD

  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // שוליים
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 5, height);
  ctx.fillRect(width - 5, 0, 5, height);
}
=======
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // 10. קווים צהובים בשוליים
  ctx.fillStyle = '#eab308';
  ctx.fillRect(road.left, 0, 4, height);
  ctx.fillRect(road.left + road.width - 4, 0, 4, height);

  // 11. עצי תלת-מימד שרצים לאחור בצדי הדרך
  const leftTreeZone = Math.max(25, road.left - 45);
  const rightTreeZone = Math.min(width - 25, road.left + road.width + 45);
  const treeSpacing = 220; // מרווח בין העצים
  
  for (let y = (offset % treeSpacing) - treeSpacing; y < height + treeSpacing; y += treeSpacing) {
    if (leftTreeZone > 30) {
      drawTree(ctx, leftTreeZone - 30, y);
    }
    if (rightTreeZone < width - 30) {
      drawTree(ctx, rightTreeZone + 30, y + (treeSpacing / 2));
    }
  }
}

/** פונקציית עזר לציור ענן ריאליסטי */
function drawCloud(ctx, x, y, scale, opacity) {
  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.arc(25, -15, 25, 0, Math.PI * 2);
  ctx.arc(50, 0, 20, 0, Math.PI * 2);
  ctx.arc(25, 10, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** פונקציית עזר לציור עץ עם נפח וצל */
function drawTree(ctx, x, y) {
  // צל על האדמה
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // גזע העץ
  ctx.fillStyle = '#451a03'; // חום כהה ועמוק
  ctx.fillRect(x - 6, y - 10, 12, 22);
  
  // צמרת (שכבה אחורית כהה לנפח)
  ctx.fillStyle = '#065f46';
  ctx.beginPath();
  ctx.arc(x, y - 14, 24, 0, Math.PI * 2);
  ctx.fill();
  
  // צמרת (שכבה קדמית מוארת)
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(x - 5, y - 22, 18, 0, Math.PI * 2);
  ctx.fill();
}
>>>>>>> upgrade-v3
