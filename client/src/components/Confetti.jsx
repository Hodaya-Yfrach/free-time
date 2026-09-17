// ============================================================================
//  Confetti.jsx — פיצוץ קונפטי על כל המסך
//  ----------------------------------------------------------------------
//  מומש בקנבס ובלי שום ספרייה חיצונית: 220 חלקיקים שמקבלים
//  מהירות אקראית מהמרכז, כוח כבידה והתנגדות אוויר.
//  זה גם מהיר יותר מ-220 אלמנטים ב-DOM וגם שומר על הפרויקט רזה.
// ============================================================================

import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 220;
const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#facc15'];

export default function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // יצירת החלקיקים — פיצוץ רדיאלי מהמרכז
    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 250 + Math.random() * 650;
      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 10,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    });

    let raf;
    let last = performance.now();

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.vy += 900 * dt;        // כבידה
        p.vx *= 0.985;           // התנגדות אוויר
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
