// ============================================================================
//  Leaderboard.jsx — לוח התוצאות של החדר
//  הדירוג מגיע מהשרת ומשלב נקודות וזמן משחק.
// ============================================================================

export default function Leaderboard({ players, myName }) {
  if (!players.length) {
    return <p className="leaderboard__empty">עוד אף אחת לא צברה נקודות בחדר הזה.</p>;
  }

  return (
    <ol className="leaderboard">
      {players.map((player) => {
        const isMe = player.name === myName;
        const classes = [
          'leaderboard__row',
          player.place === 1 ? 'is-leader' : '',
          isMe ? 'is-me' : '',
        ].filter(Boolean).join(' ');

        return (
          <li key={player.id} className={classes}>
            {/* המקום מוצג כתג עגול בולט - זה מה שחשוב לראות ראשון */}
            <span className="leaderboard__badge">{player.place}</span>
            <span className="leaderboard__name">
              {player.name}
              {player.paused && <span className="leaderboard__paused"> ⏸</span>}
              <small className="leaderboard__level">שלב {player.level}</small>
            </span>
            {/* הניקוד מוצג עדין ומוקטן בכוונה - הדגש הוא על המקום, לא על המספר */}
            <span className="leaderboard__points">{player.points}</span>
          </li>
        );
      })}
    </ol>
  );
}
