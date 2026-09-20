// ============================================================================
//  DollarGame.jsx — בריחת הדולר
//  ----------------------------------------------------------------------
//  זה בדיוק ההפך ממרוץ המכשולים:
//    • שם — השחקנית זזה והמכשולים עומדים במקום.
//    • כאן — השודדים רודפים באופן פעיל, והשחקנית בורחת עם העכבר.
//
//  מנגנון המטבעות (עודכן): במקום מטבע בודד עם "שעון חיים", יש עכשיו
//  "גל" של כמה מטבעות במסך בו-זמנית. כל 5 שניות בדיוק נולד גל חדש -
//  בלי קשר אם הצליחו לתפוס את כל המטבעות של הגל הקודם או לא.
//  אם מצליחים לתפוס את *כל* המטבעות של הגל לפני שהוא מתחלף - זו "הצלחת
//  גל", וזה מה שפותח ניסיון לתפוס חלק במדליה (במקום הבדיקה הכללית
//  של "ענית תוך 3 שניות", שכמעט תמיד הייתה נכונה כאן ולכן לא אמרה כלום).
//
//  עליית שלב: רק אחרי 5 ריענוני לוח (5 גלים). כל ריענון נספר, גם אם לא
//  תפסו את כל המטבעות - המשחק קורא ל-completeLevel של המנוע.
// ============================================================================

import { useEffect, useRef } from 'react';
import { useCanvasStage } from '../useCanvasStage.js';
import { MAX_OBJECTS_ON_SCREEN } from '../../shared/scoring.js';

const PLAYER_RADIUS = 20;
const ROBBER_RADIUS = 20;
const COIN_RADIUS = 16;
const BASE_ROBBER_SPEED = 85;   // פיקסלים לשנייה בשלב 1
const PLAYER_EASE = 14;         // כמה "כבד" השטר ביחס לעכבר

const WAVE_MS = 5000;           // כל 5 שניות בדיוק נולד גל מטבעות חדש
const WAVES_PER_LEVEL = 5;      // כמה ריענוני לוח צריך כדי לעבור שלב
const MIN_COINS_PER_WAVE = 5;   // הרבה מטבעות על המסך בו-זמנית, כמו שביקשת
const MAX_COINS_PER_WAVE = 10;

export default function DollarGame({ engine }) {
  const {
    config, level, failed, frozen, registerSuccess, registerFailure, triggerMedalChallenge, ownedPrizes,
    completeLevel, setLevelProgress, powerHandlerRef, shieldsRef, shieldGraceUntilRef,
  } = engine;

  // הפרס העיצובי האחרון שנרכש עבור השטר (אם נרכש) - עיצוב/סמל חלופי
  const equippedRef = useRef(null);
  useEffect(() => {
    const dollarPrizes = (ownedPrizes || []).filter((p) => p.appliesTo === 'dollar');
    equippedRef.current = dollarPrizes.length ? dollarPrizes[dollarPrizes.length - 1] : null;
  }, [ownedPrizes]);

  const world = useRef({
    player: { x: 0.5, y: 0.5 },   // מיקום יחסי
    pointer: { x: 0.5, y: 0.5 },
    robbers: [],
    coins: [],
    waveMsLeft: WAVE_MS,
    waveCleared: false,          // האם כבר הופעל טריגר המדליה בגל הזה
    wavesDone: 0,                // כמה ריענוני לוח כבר עברו בשלב הנוכחי
    fx: { freeze: 0, slow: 0, ghost: 0, shrink: 0, dash: 0, decoy: 0 },
    decoy: null,
    spawnTimer: 0,
    graceTimer: 1.5,             // שנייה וחצי חסינות בתחילת כל סיבוב
  });

  const frozenRef = useRef(frozen);
  const configRef = useRef(config);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);
  useEffect(() => { configRef.current = config; }, [config]);

  /** כמות המטבעות בגל, לפי השלב הנוכחי (יותר מטבעות ככל שמתקדמים) */
  function coinsForLevel(lvl) {
    return Math.min(MAX_COINS_PER_WAVE, MIN_COINS_PER_WAVE + Math.floor((lvl - 1) / 3));
  }

  function spawnWave(w, lvl) {
    const count = coinsForLevel(lvl);
    w.coins = Array.from({ length: count }, spawnCoin);
    w.waveMsLeft = WAVE_MS;
    w.waveCleared = false;
  }

  function resetArena(w, lvl) {
    w.robbers = [];
    w.spawnTimer = 0;
    w.graceTimer = 1.5;
    w.player = { x: 0.5, y: 0.5 };
    w.pointer = { x: 0.5, y: 0.5 };
    w.wavesDone = 0;
    w.decoy = null;
    w.fx.decoy = 0;
    setLevelProgress(0);
    spawnWave(w, lvl);
  }

  /**
   * איפוס מלא של הזירה - בטעינה הראשונה ובכל עליית שלב אמיתית.
   * בכוונה *לא* תלוי ב-roundKey של המנוע: roundKey מתעדכן גם אחרי כל
   * תפיסת מטבע בודדת (זה נכון למשחקי "שאלה בכל פעם" כמו הצורות/המכונית),
   * וזה בדיוק מה שגרם לבאג "המסך מתאפס בכל תפיסת מטבע" - כל גל המטבעות
   * נמחק ונולד מחדש בכל תשובה נכונה, במקום רק כל 5 שניות. כאן מתאפסים
   * רק לפי שינוי אמיתי בשלב.
   */
  useEffect(() => {
    resetArena(world.current, level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  /** איפוס נוסף בדיוק ברגע שחוזרים ממסך הכישלון (אחרי התנגשות עם שודד) */
  const prevFailedRef = useRef(failed);
  useEffect(() => {
    const recoveredFromFailure = prevFailedRef.current && !failed;
    prevFailedRef.current = failed;
    if (recoveredFromFailure) resetArena(world.current, configRef.current.level);
  }, [failed]);

  useEffect(() => {
    powerHandlerRef.current = (item) => {
      const w = world.current;
      const seconds = item.params?.seconds || 0;

      if (item.effect === 'freeze_robbers') { w.fx.freeze = seconds; return true; }
      if (item.effect === 'slow_robbers') { w.fx.slow = seconds; return true; }
      if (item.effect === 'ghost_dollar') { w.fx.ghost = seconds; return true; }
      if (item.effect === 'shrink') { w.fx.shrink = seconds; return true; }
      if (item.effect === 'dash') { w.fx.dash = seconds; return true; }

      if (item.effect === 'decoy') {
        w.decoy = { x: w.player.x, y: w.player.y };
        w.fx.decoy = seconds;
        return true;
      }

      if (item.effect === 'magnet') {
        const remaining = w.coins.filter((c) => !c.caught);
        if (!remaining.length) return false;
        for (const coin of remaining) {
          coin.caught = true;
          registerSuccess(w.waveMsLeft / WAVE_MS, { skipFastCheck: true });
        }
        w.waveCleared = true;
        return true;
      }

      if (item.effect === 'shockwave') {
        if (!w.robbers.length) return false;
        const corners = cornersByDistance(w.player).slice(0, 3);
        w.robbers.forEach((robber, i) => {
          const corner = corners[i % corners.length];
          robber.x = corner.x;
          robber.y = corner.y;
        });
        w.graceTimer = Math.max(w.graceTimer, 0.6);
        return true;
      }

      return false;
    };
  });

  const { canvasRef } = useCanvasStage((ctx, size, dt) => {
    const { width, height } = size;
    if (!width || !height) return;

    const w = world.current;
    const cfg = configRef.current;

    if (!frozenRef.current) {
      if (w.graceTimer > 0) w.graceTimer -= dt;
      for (const key of Object.keys(w.fx)) {
        if (w.fx[key] > 0) w.fx[key] = Math.max(0, w.fx[key] - dt);
      }

      // ---- השטר נמשך אל העכבר. ההחלקה נותנת לשודדים סיכוי.
      const ease = PLAYER_EASE * (w.fx.dash > 0 ? 2 : 1);
      w.player.x += (w.pointer.x - w.player.x) * Math.min(1, ease * dt);
      w.player.y += (w.pointer.y - w.player.y) * Math.min(1, ease * dt);

      const px = w.player.x * width;
      const py = w.player.y * height;

      // ---- הוספת שודדים עד המכסה של השלב
      const wanted = Math.min(cfg.hazards, MAX_OBJECTS_ON_SCREEN);
      w.spawnTimer -= dt;
      if (w.robbers.length < wanted && w.spawnTimer <= 0) {
        w.robbers.push(spawnRobber(w.player));
        w.spawnTimer = 1.2;
      }

      // ---- השודדים רודפים
      const speedMultiplier = w.fx.freeze > 0 ? 0 : w.fx.slow > 0 ? 0.5 : 1;
      const robberSpeed = BASE_ROBBER_SPEED * cfg.speedFactor * speedMultiplier;
      const playerRadius = PLAYER_RADIUS * (w.fx.shrink > 0 ? 0.5 : 1);
      const chase = w.fx.decoy > 0 && w.decoy
        ? { x: w.decoy.x * width, y: w.decoy.y * height }
        : { x: px, y: py };
      for (const robber of w.robbers) {
        const dx = chase.x - robber.x * width;
        const dy = chase.y - robber.y * height;
        const distance = Math.hypot(dx, dy) || 1;

        robber.x += (dx / distance) * robberSpeed * dt / width;
        robber.y += (dy / distance) * robberSpeed * dt / height;

        const touchDistance = Math.hypot(px - robber.x * width, py - robber.y * height);
        if (w.graceTimer <= 0 && w.fx.ghost <= 0 && touchDistance < playerRadius + ROBBER_RADIUS) {
          if (registerFailure()) return;
          const corner = spawnRobber(w.player);
          robber.x = corner.x;
          robber.y = corner.y;
        }
      }

      // ---- תפיסת מטבעות מהגל הנוכחי
      for (const coin of w.coins) {
        if (coin.caught) continue;
        const dx = px - coin.x * width;
        const dy = py - coin.y * height;
        if (Math.hypot(dx, dy) < PLAYER_RADIUS + COIN_RADIUS) {
          coin.caught = true;
          // בונוס מהירות לפי כמה מזמן הגל עוד נשאר. skipFastCheck=true כי
          // "תפיסת מטבע בודד תוך 3 שניות" קורה כמעט תמיד ולא אומר כלום -
          // הטריגר האמיתי כאן הוא ניקוי הגל כולו (למטה).
          registerSuccess(w.waveMsLeft / WAVE_MS, { skipFastCheck: true });
        }
      }

      // ---- ניקוי גל שלם = ניסיון לתפוס חלק במדליה
      const allCaught = w.coins.length > 0 && w.coins.every((c) => c.caught);
      if (allCaught && !w.waveCleared) {
        w.waveCleared = true;
        triggerMedalChallenge();
      }

      // ---- כל 5 שניות בדיוק - גל חדש, גם אם לא תפסו את כל הקודם
      w.waveMsLeft -= dt * 1000;
      if (w.waveMsLeft <= 0) {
        w.wavesDone += 1;
        setLevelProgress(w.wavesDone / WAVES_PER_LEVEL);
        if (w.wavesDone >= WAVES_PER_LEVEL) {
          w.wavesDone = 0;
          completeLevel();
        }
        spawnWave(w, cfg.level);
      }
    }

    // ------------------------------------------------------------- ציור
    drawFloor(ctx, width, height);

    // פס התקדמות עדין למעלה - כמה זמן נשאר לגל הנוכחי
    ctx.fillStyle = 'rgba(234,179,8,0.85)';
    ctx.fillRect(0, 0, width * Math.max(0, w.waveMsLeft / WAVE_MS), 5);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '30px serif';
    for (const coin of w.coins) {
      if (coin.caught) continue;
      ctx.fillText('🪙', coin.x * width, coin.y * height);
    }

    if (w.fx.decoy > 0 && w.decoy) {
      ctx.font = '34px serif';
      ctx.fillText('🎭', w.decoy.x * width, w.decoy.y * height);
    }

    ctx.font = '34px serif';
    ctx.globalAlpha = w.fx.freeze > 0 ? 0.55 : 1;
    for (const robber of w.robbers) {
      ctx.fillText('🥷', robber.x * width, robber.y * height);
    }
    ctx.globalAlpha = 1;

    const playerCx = w.player.x * width;
    const playerCy = w.player.y * height;

    if (shieldsRef.current > 0 || performance.now() < shieldGraceUntilRef.current) {
      ctx.strokeStyle = 'rgba(96,165,250,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(playerCx, playerCy, PLAYER_RADIUS + 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.font = `${w.fx.shrink > 0 ? 22 : 38}px serif`;
    ctx.globalAlpha = w.graceTimer > 0 || w.fx.ghost > 0 ? 0.55 : 1;
    ctx.fillText(equippedRef.current?.value?.emoji || '💵', playerCx, playerCy);
    ctx.globalAlpha = 1;

    drawEffects(ctx, w.fx);
  }, []);

  /** תנועת העכבר היא ההגה של המשחק הזה */
  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    world.current.pointer = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  }

  return (
    <div className="stage-wrap">
      <p className="stage-hint">
        הזיזי את העכבר כדי להבריח את השטר. אספי את כל המטבעות לפני שהגל מתחלף (כל 5 שניות) - זה פותח ניסיון לתפוס חלק במדליה. אחרי 5 ריענוני לוח עוברים שלב. אל תיתני לשודדים לגעת.
      </p>
      <canvas
        ref={canvasRef}
        className="stage-canvas stage-canvas--floor"
        onPointerMove={handleMove}
      />
    </div>
  );
}

/** שודד חדש נכנס מאחת הפינות, רחוק מהשחקנית */
function spawnRobber(player) {
  const corners = [
    { x: 0.05, y: 0.05 }, { x: 0.95, y: 0.05 },
    { x: 0.05, y: 0.95 }, { x: 0.95, y: 0.95 },
  ];
  // בוחרים את הפינה הרחוקה ביותר מהשחקנית כדי לא "להקפיץ" שודד עליה
  let best = corners[0];
  let bestDistance = -1;
  for (const corner of corners) {
    const distance = Math.hypot(corner.x - player.x, corner.y - player.y);
    if (distance > bestDistance) {
      bestDistance = distance;
      best = corner;
    }
  }
  return { x: best.x, y: best.y };
}

function cornersByDistance(player) {
  const corners = [
    { x: 0.05, y: 0.05 }, { x: 0.95, y: 0.05 },
    { x: 0.05, y: 0.95 }, { x: 0.95, y: 0.95 },
  ];
  return corners.sort(
    (a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y)
  );
}

const FX_ICONS = { freeze: '🧊', slow: '🐌', ghost: '👻', shrink: '🤏', dash: '⚡', decoy: '🎭' };

function drawEffects(ctx, fx) {
  ctx.save();
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  let x = 12;
  for (const [key, left] of Object.entries(fx)) {
    if (left <= 0) continue;
    ctx.fillText(`${FX_ICONS[key]} ${left.toFixed(1)}`, x, 26);
    x += 78;
  }
  ctx.restore();
}

function spawnCoin() {
  return {
    x: 0.12 + Math.random() * 0.76,
    y: 0.12 + Math.random() * 0.76,
    caught: false,
  };
}

/** רקע הזירה — רשת עדינה שנותנת תחושת מרחב */
function drawFloor(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(148,163,184,0.18)';
  ctx.lineWidth = 1;
  const step = 44;
  for (let x = step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
