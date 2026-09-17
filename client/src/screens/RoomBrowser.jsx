// ============================================================================
//  RoomBrowser.jsx — איתור חדרים פעילים
//  ----------------------------------------------------------------------
//  מציג לכל חדר: הקוד, כמה שחקניות בפנים, אילו משחקים משוחקים בו
//  ומי מוביל ובכמה נקודות. לחיצה על חדר ממלאת את הקוד בטופס.
// ============================================================================

import { useState } from 'react';
import { useGame } from '../state/GameContext.jsx';

export default function RoomBrowser({ onPick }) {
  const { fetchRooms } = useGame();
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const list = await fetchRooms();
    setRooms(list || []);
    setLoading(false);
  }

  return (
    <div className="browser">
      <button className="btn btn--ghost" onClick={refresh} disabled={loading}>
        {loading ? 'מחפש חדרים…' : '🔎 איתור חדרים פעילים'}
      </button>

      {rooms !== null && rooms.length === 0 && (
        <p className="browser__empty">אין כרגע חדרים פעילים. פתחי חדר חדש עם קוד משלך.</p>
      )}

      {rooms !== null && rooms.length > 0 && (
        <ul className="browser__list">
          {rooms.map((room) => (
            <li key={room.code}>
              <button className="browser__room" onClick={() => onPick(room.code)}>
                <span className="browser__code">{room.code}</span>

                <span className="browser__games">
                  {room.games.map((game) => (
                    <span key={game.id} title={game.name}>{game.icon}</span>
                  ))}
                </span>

                <span className="browser__players">{room.players} שחקניות</span>

                <span className="browser__top">
                  {room.topName ? `👑 ${room.topName} · ${room.topPoints} נק'` : 'אין ניקוד עדיין'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
