// ============================================================================
//  DollarGame.jsx — בריחת הדולר
<<<<<<< HEAD
//  ----------------------------------------------------------------------
//  זה בדיוק ההפך ממרוץ המכשולים:
//    • שם — השחקנית זזה והמכשולים עומדים במקום.
//    • כאן — השודדים רודפים באופן פעיל, והשחקנית בורחת עם העכבר.
//
//  הסמן הופך לשטר דולר. מטבעות מופיעים לזמן מוגבל; איסוף מטבע
//  נחשב "תשובה נכונה" במנוע הניקוד, ובונוס המהירות נקבע לפי
//  כמה זמן נשאר למטבע לחיות. מגע של שודד = כישלון.
=======
>>>>>>> upgrade-v3
// ============================================================================

import { useEffect, useRef } from 'react';
import { useCanvasStage } from '../useCanvasStage.js';
import { MAX_OBJECTS_ON_SCREEN } from '../../shared/scoring.js';

const PLAYER_RADIUS = 20;
const ROBBER_RADIUS = 20;
const COIN_RADIUS = 16;
<<<<<<< HEAD
const BASE_ROBBER_SPEED = 85;   // פיקסלים לשנייה בשלב 1
const COIN_LIFETIME = 6;        // שניות עד שמטבע נעלם
const PLAYER_EASE = 14;         // כמה "כבד" השטר ביחס לעכבר

export default function DollarGame({ engine }) {
  const { config, frozen, roundKey, registerSuccess, registerFailure } = engine;

  const world = useRef({
    player: { x: 0.5, y: 0.5 },   // מיקום יחסי
    pointer: { x: 0.5, y: 0.5 },
    robbers: [],
    coin: null,
    spawnTimer: 0,
    graceTimer: 1.5,              // שנייה וחצי חסינות בתחילת כל סיבוב
=======
const BASE_ROBBER_SPEED = 85; 
const PLAYER_EASE = 14; 

const WAVE_MS = 5000; 
const WAVES_PER_LEVEL = 5; 
const MIN_COINS_PER_WAVE = 5; 
const MAX_COINS_PER_WAVE = 10;

export default function DollarGame({ engine }) {
  const {
    config, level, failed, frozen, registerSuccess, registerFailure, triggerMedalChallenge, ownedPrizes,
    completeLevel, setLevelProgress, powerHandlerRef, shieldsRef, shieldGraceUntilRef,
  } = engine;

  const equippedRef = useRef(null);
  useEffect(() => {
    const dollarPrizes = (ownedPrizes || []).filter((p) => p.appliesTo === 'dollar');
    equippedRef.current = dollarPrizes.length ? dollarPrizes[dollarPrizes.length - 1] : null;
  }, [ownedPrizes]);

  const world = useRef({
    player: { x: 0.5, y: 0.5 }, 
    pointer: { x: 0.5, y: 0.5 },
    robbers: [],
    coins: [],
    waveMsLeft: WAVE_MS,
    waveCleared: false,
    wavesDone: 0,
    fx: { freeze: 0, slow: 0, ghost: 0, shrink: 0, dash: 0, decoy: 0 },
    decoy: null,
    spawnTimer: 0,
    graceTimer: 1.5,
>>>>>>> upgrade-v3
  });

  const frozenRef = useRef(frozen);
  const configRef = useRef(config);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);
  useEffect(() => { configRef.current = config; }, [config]);

<<<<<<< HEAD
  // סיבוב חדש: מנקים את הזירה ומחזירים את השטר למרכז
  useEffect(() => {
    const w = world.current;
    w.robbers = [];
    w.coin = null;
=======
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
>>>>>>> upgrade-v3
    w.spawnTimer = 0;
    w.graceTimer = 1.5;
    w.player = { x: 0.5, y: 0.5 };
    w.pointer = { x: 0.5, y: 0.5 };
<<<<<<< HEAD
  }, [roundKey]);
=======
    w.wavesDone = 0;
    w.decoy = null;
    w.fx.decoy = 0;
    setLevelProgress(0);
    spawnWave(w, lvl);
  }

  useEffect(() => {
    resetArena(world.current, level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

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
>>>>>>> upgrade-v3

  const { canvasRef } = useCanvasStage((ctx, size, dt) => {
    const { width, height } = size;
    if (!width || !height) return;

    const w = world.current;
    const cfg = configRef.current;

    if (!frozenRef.current) {
      if (w.graceTimer > 0) w.graceTimer -= dt;
<<<<<<< HEAD

      // ---- השטר נמשך אל העכבר. ההחלקה נותנת לשודדים סיכוי.
      w.player.x += (w.pointer.x - w.player.x) * Math.min(1, PLAYER_EASE * dt);
      w.player.y += (w.pointer.y - w.player.y) * Math.min(1, PLAYER_EASE * dt);
=======
      for (const key of Object.keys(w.fx)) {
        if (w.fx[key] > 0) w.fx[key] = Math.max(0, w.fx[key] - dt);
      }

      const ease = PLAYER_EASE * (w.fx.dash > 0 ? 2 : 1);
      w.player.x += (w.pointer.x - w.player.x) * Math.min(1, ease * dt);
      w.player.y += (w.pointer.y - w.player.y) * Math.min(1, ease * dt);
>>>>>>> upgrade-v3

      const px = w.player.x * width;
      const py = w.player.y * height;

<<<<<<< HEAD
      // ---- הוספת שודדים עד המכסה של השלב
=======
>>>>>>> upgrade-v3
      const wanted = Math.min(cfg.hazards, MAX_OBJECTS_ON_SCREEN);
      w.spawnTimer -= dt;
      if (w.robbers.length < wanted && w.spawnTimer <= 0) {
        w.robbers.push(spawnRobber(w.player));
        w.spawnTimer = 1.2;
      }

<<<<<<< HEAD
      // ---- השודדים רודפים
      const robberSpeed = BASE_ROBBER_SPEED * cfg.speedFactor;
      for (const robber of w.robbers) {
        const dx = px - robber.x * width;
        const dy = py - robber.y * height;
=======
      const speedMultiplier = w.fx.freeze > 0 ? 0 : w.fx.slow > 0 ? 0.5 : 1;
      const robberSpeed = BASE_ROBBER_SPEED * cfg.speedFactor * speedMultiplier;
      const playerRadius = PLAYER_RADIUS * (w.fx.shrink > 0 ? 0.5 : 1);
      const chase = w.fx.decoy > 0 && w.decoy
        ? { x: w.decoy.x * width, y: w.decoy.y * height }
        : { x: px, y: py };
      for (const robber of w.robbers) {
        const dx = chase.x - robber.x * width;
        const dy = chase.y - robber.y * height;
>>>>>>> upgrade-v3
        const distance = Math.hypot(dx, dy) || 1;

        robber.x += (dx / distance) * robberSpeed * dt / width;
        robber.y += (dy / distance) * robberSpeed * dt / height;

<<<<<<< HEAD
        if (w.graceTimer <= 0 && distance < PLAYER_RADIUS + ROBBER_RADIUS) {
          registerFailure();
          return;
        }
      }

      // ---- מטבעות
      if (!w.coin) {
        w.coin = spawnCoin();
      } else {
        w.coin.life -= dt;
        if (w.coin.life <= 0) {
          w.coin = spawnCoin(); // מטבע שפג — פשוט מופיע במקום אחר
        } else {
          const dx = px - w.coin.x * width;
          const dy = py - w.coin.y * height;
          if (Math.hypot(dx, dy) < PLAYER_RADIUS + COIN_RADIUS) {
            // בונוס מהירות לפי כמה מהר הגעתי למטבע
            registerSuccess(w.coin.life / COIN_LIFETIME);
            w.coin = null;
          }
        }
      }
    }

    // ------------------------------------------------------------- ציור
    drawFloor(ctx, width, height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (w.coin) {
      const cx = w.coin.x * width;
      const cy = w.coin.y * height;
      // טבעת שמתכווצת ומראה כמה זמן נשאר למטבע
      ctx.strokeStyle = 'rgba(234,179,8,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, COIN_RADIUS + 8, -Math.PI / 2,
        -Math.PI / 2 + (w.coin.life / COIN_LIFETIME) * Math.PI * 2);
      ctx.stroke();

      ctx.font = '30px serif';
      ctx.fillText('🪙', cx, cy);
    }

    ctx.font = '34px serif';
    for (const robber of w.robbers) {
      ctx.fillText('🥷', robber.x * width, robber.y * height);
    }

    ctx.font = '38px serif';
    ctx.globalAlpha = w.graceTimer > 0 ? 0.55 : 1;
    ctx.fillText('💵', w.player.x * width, w.player.y * height);
    ctx.globalAlpha = 1;
  }, []);

  /** תנועת העכבר היא ההגה של המשחק הזה */
=======
        const touchDistance = Math.hypot(px - robber.x * width, py - robber.y * height);
        if (w.graceTimer <= 0 && w.fx.ghost <= 0 && touchDistance < playerRadius + ROBBER_RADIUS) {
          if (registerFailure()) return;
          const corner = spawnRobber(w.player);
          robber.x = corner.x;
          robber.y = corner.y;
        }
      }

      for (const coin of w.coins) {
        if (coin.caught) continue;
        const dx = px - coin.x * width;
        const dy = py - coin.y * height;
        if (Math.hypot(dx, dy) < PLAYER_RADIUS + COIN_RADIUS) {
          coin.caught = true;
          registerSuccess(w.waveMsLeft / WAVE_MS, { skipFastCheck: true });
        }
      }

      const allCaught = w.coins.length > 0 && w.coins.every((c) => c.caught);
      if (allCaught && !w.waveCleared) {
        w.waveCleared = true;
        triggerMedalChallenge();
      }

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

    drawFloor(ctx, width, height);

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

>>>>>>> upgrade-v3
  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    world.current.pointer = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  }

  return (
    <div className="stage-wrap">
<<<<<<< HEAD
      <p className="stage-hint">הזיזי את העכבר כדי להבריח את השטר. אספי מטבעות, אל תיתני לשודדים לגעת.</p>
=======
      <p className="stage-hint">
        הזיזי את העכבר כדי להתחמק מהשודדים. אספי את כל המטבעות בגל (מתחדש כל 5 שניות) כדי לנסות לזכות במדליה. הישרדות של 5 גלים תעביר אותך לשלב הבא!
      </p>
>>>>>>> upgrade-v3
      <canvas
        ref={canvasRef}
        className="stage-canvas stage-canvas--floor"
        onPointerMove={handleMove}
      />
    </div>
  );
}

<<<<<<< HEAD
/** שודד חדש נכנס מאחת הפינות, רחוק מהשחקנית */
=======
>>>>>>> upgrade-v3
function spawnRobber(player) {
  const corners = [
    { x: 0.05, y: 0.05 }, { x: 0.95, y: 0.05 },
    { x: 0.05, y: 0.95 }, { x: 0.95, y: 0.95 },
  ];
<<<<<<< HEAD
  // בוחרים את הפינה הרחוקה ביותר מהשחקנית כדי לא "להקפיץ" שודד עליה
=======
>>>>>>> upgrade-v3
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

<<<<<<< HEAD
=======
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

>>>>>>> upgrade-v3
function spawnCoin() {
  return {
    x: 0.12 + Math.random() * 0.76,
    y: 0.12 + Math.random() * 0.76,
<<<<<<< HEAD
    life: COIN_LIFETIME,
  };
}

/** רקע הזירה — רשת עדינה שנותנת תחושת מרחב */
=======
    caught: false,
  };
}

>>>>>>> upgrade-v3
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
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
