// ============================================================================
//  LobbyScreen.jsx — בחירת משחק, שם וחדר
// ============================================================================

import { useState } from 'react';
import { GAMES } from '../shared/games.js';
import {
  loadAllProgress, loadLastName, saveLastName,
  progressAtRisk, clearProgress, loadProgress,
} from '../storage/progress.js';
import { useGame } from '../state/GameContext.jsx';
import RoomBrowser from './RoomBrowser.jsx';
import GamesInfo from '../components/GamesInfo.jsx';
import AboutPage from '../components/AboutPage.jsx';
import ContactPage from '../components/ContactPage.jsx';

const NAV_TABS = [
  { id: 'home', label: '🏠 ראשי' },
  { id: 'info', label: '📊 איך משחקים?' },
  { id: 'about', label: 'ℹ️ אודות' },
  { id: 'contact', label: '✉️ יצירת קשר' },
];

export default function LobbyScreen({ onStart }) {
  const { joinRoom, connected } = useGame();

  const [view, setView] = useState('home'); 
  const [gameId, setGameId] = useState(GAMES[0].id);
  const [name, setName] = useState(loadLastName());
  const [roomCode, setRoomCode] = useState('');
  const [warning, setWarning] = useState(null); 
  const [busy, setBusy] = useState(false);

  const saved = loadAllProgress(GAMES.map((g) => g.id));

  function normalized() {
    return roomCode.trim().toUpperCase();
  }

  async function enter({ reset }) {
    const code = normalized();
    if (!code || !name.trim()) return;

    setBusy(true);
    saveLastName(name.trim());

    if (reset) clearProgress(gameId);

    const stored = loadProgress(gameId);
    const restoredProgress = stored && stored.roomCode === code ? stored : null;

    const response = await joinRoom({
      roomCode: code,
      name: name.trim(),
      gameId,
      restoredProgress,
    });

    setBusy(false);
    setWarning(null);

    if (response) onStart({ gameId, initialProgress: restoredProgress });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const code = normalized();
    if (!code || !name.trim()) return;

    const atRisk = progressAtRisk(gameId, code);
    if (atRisk) {
      setWarning({ ...atRisk, nextRoom: code });
      return;
    }

    enter({ reset: false });
  }

  return (
    <div className="lobby">
      <header className="lobby__header">
        <h1>קרב המדליה</h1>
        <p>שלושה משחקים. חדר אחד. אלופה אחת.</p>
      </header>

      <nav className="lobby__nav">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={view === tab.id ? 'lobby__nav-btn is-active' : 'lobby__nav-btn'}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {view === 'info' && <GamesInfo />}
      {view === 'about' && <AboutPage />}
      {view === 'contact' && <ContactPage />}

      {view === 'home' && (
        <>
      <section className="lobby__section">
        <h2 className="lobby__section-title">באיזה משחק נתחיל?</h2>

        <div className="game-picker">
          {GAMES.map((game) => {
            const progress = saved[game.id];
            const selected = game.id === gameId;
            return (
              <button
                key={game.id}
                type="button"
                className={selected ? 'game-card is-selected' : 'game-card'}
                style={{ '--accent': game.accent }}
                onClick={() => setGameId(game.id)}
                aria-pressed={selected}
              >
                <span className="game-card__icon">{game.icon}</span>
                <span className="game-card__name">{game.name}</span>
                <span className="game-card__tagline">{game.tagline}</span>
                <span className="game-card__description">{game.description}</span>

                {progress && progress.points > 0 && (
                  <span className="game-card__saved">
                    התקדמות שמורה: {progress.points} נק' · שלב {progress.level} · חדר {progress.roomCode}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="lobby__section">
        <form className="join-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>איך קוראים לך?</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="הזיני כינוי (לדוגמה: נועה)"
              required
            />
          </label>

          <label className="field">
            <span>קוד חדר</span>
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={12}
              placeholder="לדוגמה: OFFICE1"
              required
            />
          </label>

          <button className="btn btn--primary" type="submit" disabled={busy || !connected}>
            {connected ? (busy ? 'מתחברת...' : 'כניסה לחדר') : 'מייצר חיבור לשרת...'}
          </button>
        </form>

        <p className="lobby__hint">
          * כל משתתפת שתזין את אותו קוד חדר תשחק יחד איתך. לוח התוצאות מסנכרן את כל מי שמשחקת באותו משחק במקביל.
        </p>

        <RoomBrowser onPick={setRoomCode} />
      </section>

      {warning && (
        <div className="overlay overlay--dialog">
          <div className="panel panel--dialog">
            <div className="panel__icon">⚠️</div>
            <h2>שים לב: הנקודות יאופסו</h2>
            <p>
              יש לך התקדמות שמורה של <strong>{warning.points} נקודות</strong> בשלב {warning.level}
              {' '}בחדר <strong>{warning.roomCode}</strong>.
              כניסה לחדר <strong>{warning.nextRoom}</strong> תאפס את ההתקדמות במשחק הנוכחי.
            </p>
            <p className="panel__note">
              הנקודות שלך בשאר המשחקים לא ייפגעו.
            </p>

            <div className="panel__actions">
              <button className="btn btn--danger" onClick={() => enter({ reset: true })}>
                אישור והתחלה מחדש
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setRoomCode(warning.roomCode);
                  setWarning(null);
                }}
              >
                חזרה לחדר הקודם ({warning.roomCode})
              </button>
              <button className="btn btn--quiet" onClick={() => setWarning(null)}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}