// ============================================================================
//  GameScreen.jsx — המסגרת המשותפת לכל המשחקים
//  ----------------------------------------------------------------------
//  מרכיבה את מנוע המשחק, את הסרגל העליון, את לוח התוצאות ואת
//  שכבות-העל (השהיה, כישלון, עליית שלב), ומכניסה פנימה את
//  המשחק שנבחר. להוספת משחק רביעי מספיק להוסיף שורה ל-RENDERERS.
// ============================================================================

import { useGameEngine } from '../hooks/useGameEngine.js';
import { useGame } from '../state/GameContext.jsx';
import { getGame } from '../shared/games.js';

import TopBar from '../components/TopBar.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import PauseOverlay from '../components/PauseOverlay.jsx';
import FailScreen from '../components/FailScreen.jsx';
import LevelUpOverlay from '../components/LevelUpOverlay.jsx';
import MedalChallengeOverlay from '../components/MedalChallengeOverlay.jsx';
import PrizeSelectionOverlay from '../components/PrizeSelectionOverlay.jsx';
import PrizeCart from '../components/PrizeCart.jsx';
import PowerupBar from '../components/PowerupBar.jsx';

import ShapesGame from '../games/shapes/ShapesGame.jsx';
import CarGame from '../games/car/CarGame.jsx';
import DollarGame from '../games/dollar/DollarGame.jsx';

const RENDERERS = {
  shapes: ShapesGame,
  car: CarGame,
  dollar: DollarGame,
};

// הגדרות עליית-שלב ספציפיות למשחק (ברירת המחדל: LEVEL_STEP הצלחות = שלב).
// הדולר עולה שלב רק אחרי 5 ריענוני לוח (5 גלי מטבעות) - המשחק עצמו סופר
// אותם וקורא ל-completeLevel של המנוע (ר' DollarGame.jsx).
const LEVEL_UP_OVERRIDES = {
  dollar: { levelUpMode: 'external' },
};

export default function GameScreen({ gameId, initialProgress, onExit }) {
  const { session, leaderboard } = useGame();
  const engine = useGameEngine({ gameId, initialProgress, ...(LEVEL_UP_OVERRIDES[gameId] || {}) });

  const game = getGame(gameId);
  const ActiveGame = RENDERERS[gameId] || ShapesGame;

  return (
    <div className="game-screen">
      <aside className="sidebar">
        <div className="sidebar__room">
          <span className="sidebar__game">{game.icon} {game.name}</span>
          <span className="sidebar__code">חדר {session?.roomCode}</span>
        </div>

        <h2 className="sidebar__title">לוח תוצאות</h2>
        <Leaderboard players={leaderboard} myName={session?.name} />

        <PrizeCart prizes={engine.ownedPrizes} />

        <div className="sidebar__actions">
          <button className="btn btn--ghost" onClick={engine.togglePause}>
            {engine.paused ? '▶ המשך' : '⏸ השהיה'}
          </button>
          <button className="btn btn--quiet" onClick={onExit}>
            יציאה לתפריט
          </button>
        </div>

        <p className="sidebar__legend">
          הדירוג משלב נקודות וזמן משחק. כל שלב שווה 2 נקודות יותר מהקודם,
          ותשובה מהירה מכפילה את הניקוד.
        </p>
      </aside>

      <main className="playfield">
        <TopBar engine={engine} />
        <PowerupBar engine={engine} />

        <div className="playfield__stage">
          {/* המשחק עצמו מקבל רק את המנוע, ולא יודע דבר על השרת */}
          <ActiveGame engine={engine} />
          <PauseOverlay engine={engine} />
        </div>
      </main>

      <FailScreen engine={engine} />
      <LevelUpOverlay />
      <MedalChallengeOverlay engine={engine} />
      <PrizeSelectionOverlay engine={engine} />
    </div>
  );
}
