// ============================================================================
//  App.jsx — הניווט בין שני המסכים של האפליקציה
//  אין כאן ראוטר: יש בסך הכול לובי ומשחק, ומצב אחד מספיק.
// ============================================================================

import { useState } from 'react';
import LobbyScreen from './screens/LobbyScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import Toasts from './components/Toasts.jsx';
import { useGame } from './state/GameContext.jsx';

export default function App() {
  const { leaveRoom } = useGame();
  const [active, setActive] = useState(null); // { gameId, initialProgress }

  function handleExit() {
    leaveRoom();
    setActive(null);
  }

  return (
    <>
      {active ? (
        // ה-key מכריח בנייה מחדש של המנוע כשעוברים משחק
        <GameScreen
          key={active.gameId + (active.startedAt || '')}
          gameId={active.gameId}
          initialProgress={active.initialProgress}
          onExit={handleExit}
        />
      ) : (
        <LobbyScreen onStart={(payload) => setActive({ ...payload, startedAt: Date.now() })} />
      )}

      <Toasts />
    </>
  );
}
