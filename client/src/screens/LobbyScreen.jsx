// ============================================================================
//  LobbyScreen.jsx — בחירת משחק, שם וחדר
<<<<<<< HEAD
//  ----------------------------------------------------------------------
//  זרימת ההצטרפות:
//    1. בוחרים משחק. לכל משחק מוצגת ההתקדמות השמורה בדפדפן.
//    2. מזינים שם וקוד חדר (או בוחרים חדר מרשימת החדרים הפעילים).
//    3. אם יש התקדמות שמורה *באותו משחק* אבל *בחדר אחר* —
//       נפתחת אזהרה שהנקודות בחדר הישן יימחקו. רק אישור מפורש ממשיך.
//    4. אם חוזרים לאותו חדר — ההתקדמות נטענת וממשיכים מאיפה שהפסקנו.
//    5. מעבר בין משחקים לא נוגע בנקודות של המשחק השני.
=======
>>>>>>> upgrade-v3
// ============================================================================

import { useState } from 'react';
import { GAMES } from '../shared/games.js';
import {
  loadAllProgress, loadLastName, saveLastName,
  progressAtRisk, clearProgress, loadProgress,
} from '../storage/progress.js';
import { useGame } from '../state/GameContext.jsx';
import RoomBrowser from './RoomBrowser.jsx';
<<<<<<< HEAD
=======
import GamesInfo from '../components/GamesInfo.jsx';
import AboutPage from '../components/AboutPage.jsx';
import ContactPage from '../components/ContactPage.jsx';

const NAV_TABS = [
  { id: 'home', label: '🏠 ראשי' },
  { id: 'info', label: '📊 איך משחקים?' },
  { id: 'about', label: 'ℹ️ אודות' },
  { id: 'contact', label: '✉️ יצירת קשר' },
];
>>>>>>> upgrade-v3

export default function LobbyScreen({ onStart }) {
  const { joinRoom, connected } = useGame();

<<<<<<< HEAD
  const [gameId, setGameId] = useState(GAMES[0].id);
  const [name, setName] = useState(loadLastName());
  const [roomCode, setRoomCode] = useState('');
  const [warning, setWarning] = useState(null); // ההתקדמות שעומדת להימחק
  const [busy, setBusy] = useState(false);

  // תמונת מצב של מה ששמור בדפדפן לכל משחק
=======
  const [view, setView] = useState('home'); 
  const [gameId, setGameId] = useState(GAMES[0].id);
  const [name, setName] = useState(loadLastName());
  const [roomCode, setRoomCode] = useState('');
  const [warning, setWarning] = useState(null); 
  const [busy, setBusy] = useState(false);

>>>>>>> upgrade-v3
  const saved = loadAllProgress(GAMES.map((g) => g.id));

  function normalized() {
    return roomCode.trim().toUpperCase();
  }

<<<<<<< HEAD
  /** הצטרפות בפועל. reset=true מתחיל מאפס ומוחק את השמירה הישנה. */
=======
>>>>>>> upgrade-v3
  async function enter({ reset }) {
    const code = normalized();
    if (!code || !name.trim()) return;

    setBusy(true);
    saveLastName(name.trim());

    if (reset) clearProgress(gameId);

<<<<<<< HEAD
    // ממשיכים רק אם השמירה שייכת לאותו חדר
=======
>>>>>>> upgrade-v3
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

<<<<<<< HEAD
    // כאן נולדת האזהרה: אותו משחק, חדר אחר, ויש נקודות לאבד
=======
>>>>>>> upgrade-v3
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
<<<<<<< HEAD
        <p>שלושה משחקים, חדר אחד, מדליה אחת.</p>
      </header>

      {/* ---------------------------------------------- בחירת המשחק */}
      <section className="lobby__section">
        <h2 className="lobby__section-title">איזה משחק משחקות היום?</h2>
=======
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
>>>>>>> upgrade-v3

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
<<<<<<< HEAD
                    שמור: {progress.points} נק' · שלב {progress.level} · חדר {progress.roomCode}
=======
                    התקדמות שמורה: {progress.points} נק' · שלב {progress.level} · חדר {progress.roomCode}
>>>>>>> upgrade-v3
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

<<<<<<< HEAD
      {/* ------------------------------------------ שם, חדר והצטרפות */}
      <section className="lobby__section">
        <form className="join-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>השם שלך</span>
=======
      <section className="lobby__section">
        <form className="join-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>איך קוראים לך?</span>
>>>>>>> upgrade-v3
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
<<<<<<< HEAD
              placeholder="לדוגמה: נועה"
=======
              placeholder="הזיני כינוי (לדוגמה: נועה)"
>>>>>>> upgrade-v3
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
<<<<<<< HEAD
            {connected ? (busy ? 'מצטרפת…' : 'כניסה למשחק') : 'מתחבר לשרת…'}
=======
            {connected ? (busy ? 'מתחברת...' : 'כניסה לחדר') : 'מייצר חיבור לשרת...'}
>>>>>>> upgrade-v3
          </button>
        </form>

        <p className="lobby__hint">
<<<<<<< HEAD
          כל מי שמזינה את אותו קוד חדר משחקת יחד, בכל מספר שחקניות.
          לוח התוצאות מציג את מי שמשחקת את אותו משחק כמוך.
=======
          * כל משתתפת שתזין את אותו קוד חדר תשחק יחד איתך. לוח התוצאות מסנכרן את כל מי שמשחקת באותו משחק במקביל.
>>>>>>> upgrade-v3
        </p>

        <RoomBrowser onPick={setRoomCode} />
      </section>

<<<<<<< HEAD
      {/* -------------------------------- אזהרת מעבר חדר באותו משחק */}
=======
>>>>>>> upgrade-v3
      {warning && (
        <div className="overlay overlay--dialog">
          <div className="panel panel--dialog">
            <div className="panel__icon">⚠️</div>
<<<<<<< HEAD
            <h2>מעבר לחדר אחר ימחק את הנקודות</h2>
            <p>
              שמורות לך <strong>{warning.points} נקודות</strong> בשלב {warning.level}
              {' '}בחדר <strong>{warning.roomCode}</strong>.
              כניסה לחדר <strong>{warning.nextRoom}</strong> תתחיל את המשחק הזה מאפס.
=======
            <h2>שים לב: הנקודות יאופסו</h2>
            <p>
              יש לך התקדמות שמורה של <strong>{warning.points} נקודות</strong> בשלב {warning.level}
              {' '}בחדר <strong>{warning.roomCode}</strong>.
              כניסה לחדר <strong>{warning.nextRoom}</strong> תאפס את ההתקדמות במשחק הנוכחי.
>>>>>>> upgrade-v3
            </p>
            <p className="panel__note">
              הנקודות שלך בשאר המשחקים לא ייפגעו.
            </p>

            <div className="panel__actions">
              <button className="btn btn--danger" onClick={() => enter({ reset: true })}>
<<<<<<< HEAD
                כן, לעבור ולמחוק
=======
                אישור והתחלה מחדש
>>>>>>> upgrade-v3
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setRoomCode(warning.roomCode);
                  setWarning(null);
                }}
              >
<<<<<<< HEAD
                חזרה לחדר {warning.roomCode}
=======
                חזרה לחדר הקודם ({warning.roomCode})
>>>>>>> upgrade-v3
              </button>
              <button className="btn btn--quiet" onClick={() => setWarning(null)}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD
    </div>
  );
}
=======
        </>
      )}
    </div>
  );
}
>>>>>>> upgrade-v3
