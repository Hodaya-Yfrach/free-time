// ============================================================================
//  GameScreen.jsx — המסגרת המשותפת לכל המשחקים
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
import Confetti from '../components/Confetti.jsx';

import ShapesGame from '../games/shapes/ShapesGame.jsx';
import CarGame from '../games/car/CarGame.jsx';
import DollarGame from '../games/dollar/DollarGame.jsx';

const RENDERERS = {
  shapes: ShapesGame,
  car: CarGame,
  dollar: DollarGame,
};

const LEVEL_UP_OVERRIDES = {
  dollar: { levelUpMode: 'external' },
  car: { levelUpMode: 'time', levelUpThreshold: 15000 },
};

export default function GameScreen({ gameId, initialProgress, onExit }) {
  const { session, leaderboard, leaderMedal } = useGame();
  const engine = useGameEngine({ gameId, initialProgress, ...(LEVEL_UP_OVERRIDES[gameId] || {}) });

  const game = getGame(gameId);
  const ActiveGame = RENDERERS[gameId] || ShapesGame;

  return (
    <div className="game-screen">
      <aside className="sidebar">
        <div className="sidebar__room">
          <span className="sidebar__game">{game.icon} {game.name}</span>
          <span className="sidebar__code">חדר: {session?.roomCode}</span>
        </div>

        <h2 className="sidebar__title">טבלת מובילות</h2>
        <Leaderboard players={leaderboard} myName={session?.name} />

        <PrizeCart prizes={engine.ownedPrizes} />

        <div className="sidebar__actions">
          <button className="btn btn--ghost" onClick={engine.togglePause}>
            {engine.paused ? '▶ המשך משחק' : '⏸ עצור זמנית'}
          </button>
          <button className="btn btn--quiet" onClick={onExit}>
            חזרה ללובי
          </button>
        </div>

        <p className="sidebar__legend">
          * הדירוג משקלל את הניקוד הגולמי יחד עם מהירות התגובה. כל שלב שווה יותר מהקודם, ותשובות מהירות מעניקות בונוס משמעותי.
        </p>
      </aside>

      <main className="playfield">
        <TopBar engine={engine} />
        <PowerupBar engine={engine} />

        <div className="playfield__stage">
          <ActiveGame engine={engine} />
          <PauseOverlay engine={engine} />
        </div>
      </main>

      <FailScreen engine={engine} />
      <LevelUpOverlay />
      <MedalChallengeOverlay engine={engine} />
      <PrizeSelectionOverlay engine={engine} />

      {leaderMedal && (
        <div className="leader-medal" role="status" aria-live="polite">
          <Confetti />
          <div className="leader-medal__panel">
            <div className="leader-medal__icon">🏆</div>
            <div className="leader-medal__title">חילופי הובלה!</div>
            <div className="leader-medal__name">{leaderMedal.name}</div>
            <div className="leader-medal__subtitle">כבשה הרגע את המקום הראשון</div>
          </div>
        </div>
      )}
    </div>
  );
}