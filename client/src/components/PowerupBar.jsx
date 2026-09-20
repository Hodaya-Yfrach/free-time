import { useEffect } from 'react';
import { POWERUP_LABEL_ORDER } from '../shared/prizes.js';

function groupPowerups(powerups) {
  const groups = new Map();
  for (const item of powerups) {
    if (!groups.has(item.label)) groups.set(item.label, { ...item, count: 0 });
    groups.get(item.label).count += 1;
  }
  return [...groups.values()].sort(
    (a, b) => POWERUP_LABEL_ORDER.indexOf(a.label) - POWERUP_LABEL_ORDER.indexOf(b.label)
  );
}

export default function PowerupBar({ engine }) {
  const { powerups, activatePowerup, frozen, scoreBoost } = engine;

  const groups = groupPowerups(powerups);
  const manual = groups.filter((g) => g.trigger !== 'auto').slice(0, 9);
  const auto = groups.filter((g) => g.trigger === 'auto');

  useEffect(() => {
    function onKeyDown(event) {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const slot = Number(event.key);
      if (!Number.isInteger(slot) || slot < 1 || slot > manual.length) return;
      activatePowerup(manual[slot - 1].uid);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [manual, activatePowerup]);

  if (!groups.length && !scoreBoost) return null;

  return (
    <div className="powerbar" aria-label="כוחות-על">
      {auto.map((g) => (
        <span key={g.label} className="powerbar__auto" title={g.description}>
          {g.icon} {g.label} ×{g.count} · אוטומטי
        </span>
      ))}

      {manual.map((g, i) => (
        <button
          key={g.label}
          type="button"
          className="powerbar__btn"
          disabled={frozen}
          title={g.description}
          onClick={() => activatePowerup(g.uid)}
        >
          <span className="powerbar__key">{i + 1}</span>
          <span className="powerbar__icon">{g.icon}</span>
          <span className="powerbar__label">{g.label}</span>
          {g.count > 1 && <span className="powerbar__count">×{g.count}</span>}
        </button>
      ))}

      {scoreBoost && (
        <span className="powerbar__boost">
          ✨ ×{scoreBoost.factor} · {Math.ceil(scoreBoost.msLeft / 1000)} שנ'
        </span>
      )}
    </div>
  );
}
