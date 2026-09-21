<<<<<<< HEAD
// ============================================================================
//  Leaderboard.jsx — לוח התוצאות של החדר
//  הדירוג מגיע מהשרת ומשלב נקודות וזמן משחק.
// ============================================================================

export default function Leaderboard({ players, myName }) {
  if (!players.length) {
    return <p className="leaderboard__empty">עוד אף אחת לא צברה נקודות בחדר הזה.</p>;
=======
export default function Leaderboard({ players, myName }) {
  if (!players.length) {
    return <p className="leaderboard__empty">עדיין אין נקודות בחדר הזה. היי הראשונה!</p>;
>>>>>>> upgrade-v3
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
<<<<<<< HEAD
            <span className="leaderboard__place">{player.place}</span>
            <span className="leaderboard__name">
              {player.name}
              {player.paused && <span className="leaderboard__paused"> ⏸</span>}
            </span>
            <span className="leaderboard__stats">
              <strong>{player.points}</strong>
              <small>שלב {player.level}</small>
            </span>
=======
            <span className="leaderboard__badge">{player.place}</span>
            <span className="leaderboard__name">
              {player.name}
              {player.paused && <span className="leaderboard__paused"> ⏸</span>}
              <small className="leaderboard__level">שלב {player.level}</small>
            </span>
            <span className="leaderboard__points">{player.points} נק'</span>
>>>>>>> upgrade-v3
          </li>
        );
      })}
    </ol>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> upgrade-v3
