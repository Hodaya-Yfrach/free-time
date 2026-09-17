// ============================================================================
//  DollarGame.jsx — בריחת הדולר
//  ----------------------------------------------------------------------
//  זה בדיוק ההפך ממרוץ המכשולים:
//    • שם — השחקנית זזה והמכשולים עומדים במקום.
//    • כאן — השודדים רודפים באופן פעיל, והשחקנית בורחת עם העכבר.
//
//  הסמן הופך לשטר דולר. מטבעות מופיעים לזמן מוגבל; איסוף מטבע
//  נחשב "תשובה נכונה" במנוע הניקוד, ובונוס המהירות נקבע לפי
//  כמה זמן נשאר למטבע לחיות. מגע של שודד = כישלון.
// ============================================================================

import { useEffect, useRef } from 'react';
import { useCanvasStage } from '../useCanvasStage.js';
import { MAX_OBJECTS_ON_SCREEN } from '../../shared/scoring.js';

const PLAYER_RADIUS = 20;
const ROBBER_RADIUS = 20;
const COIN_RADIUS = 16;
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
  });

  const frozenRef = useRef(frozen);
  const configRef = useRef(config);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);
  useEffect(() => { configRef.current = config; }, [config]);

  // סיבוב חדש: מנקים את הזירה ומחזירים את השטר למרכז
  useEffect(() => {
    const w = world.current;
    w.robbers = [];
    w.coin = null;
    w.spawnTimer = 0;
    w.graceTimer = 1.5;
    w.player = { x: 0.5, y: 0.5 };
    w.pointer = { x: 0.5, y: 0.5 };
  }, [roundKey]);

  const { canvasRef } = useCanvasStage((ctx, size, dt) => {
    const { width, height } = size;
    if (!width || !height) return;

    const w = world.current;
    const cfg = configRef.current;

    if (!frozenRef.current) {
      if (w.graceTimer > 0) w.graceTimer -= dt;

      // ---- השטר נמשך אל העכבר. ההחלקה נותנת לשודדים סיכוי.
      w.player.x += (w.pointer.x - w.player.x) * Math.min(1, PLAYER_EASE * dt);
      w.player.y += (w.pointer.y - w.player.y) * Math.min(1, PLAYER_EASE * dt);

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
      const robberSpeed = BASE_ROBBER_SPEED * cfg.speedFactor;
      for (const robber of w.robbers) {
        const dx = px - robber.x * width;
        const dy = py - robber.y * height;
        const distance = Math.hypot(dx, dy) || 1;

        robber.x += (dx / distance) * robberSpeed * dt / width;
        robber.y += (dy / distance) * robberSpeed * dt / height;

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
  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    world.current.pointer = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  }

  return (
    <div className="stage-wrap">
      <p className="stage-hint">הזיזי את העכבר כדי להבריח את השטר. אספי מטבעות, אל תיתני לשודדים לגעת.</p>
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

function spawnCoin() {
  return {
    x: 0.12 + Math.random() * 0.76,
    y: 0.12 + Math.random() * 0.76,
    life: COIN_LIFETIME,
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
