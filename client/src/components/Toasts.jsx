// ============================================================================
//  Toasts.jsx — הודעות קצרות על מה שקורה בחדר
// ============================================================================

import { useGame } from '../state/GameContext.jsx';

export default function Toasts() {
  const { toasts } = useGame();

  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.kind}`}>
          {toast.text}
        </div>
      ))}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
