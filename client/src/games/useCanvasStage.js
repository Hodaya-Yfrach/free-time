// ============================================================================
//  useCanvasStage.js — תשתית קנבס משותפת לשני משחקי התנועה
//  ----------------------------------------------------------------------
//  מטפלת בשני דברים משעממים אך הכרחיים:
//    1. התאמת גודל הקנבס לרזולוציית המסך (devicePixelRatio), כדי
//       שהציור לא ייראה מטושטש במסכי רטינה.
//    2. לולאת אנימציה שמעבירה delta בשניות לפונקציית הציור.
// ============================================================================

import { useEffect, useRef } from 'react';

export function useCanvasStage(draw, deps = []) {
  const canvasRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const drawRef = useRef(draw);

  useEffect(() => { drawRef.current = draw; });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height };
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let raf;
    let last = performance.now();

    function frame(now) {
      // תקרה של 50ms כדי שמעבר בין טאבים לא "יקפיץ" את המשחק קדימה
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      drawRef.current(ctx, sizeRef.current, dt);
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { canvasRef, sizeRef };
}

/** ציור מלבן עם פינות מעוגלות — שימושי בשני המשחקים */
export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
