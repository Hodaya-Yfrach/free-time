// ============================================================================
//  ContactPage.jsx — "צור קשר"
//  ----------------------------------------------------------------------
//  בלי שרת ייעודי לטפסים - הכפתור פותח את תוכנת המייל של המשתמשת עם
//  נושא וגוף הודעה ממולאים מראש (mailto:). אם בעתיד ירצו טופס אמיתי
//  שנשמר איפשהו, זה המקום להוסיף קריאת socket/API במקום ה-mailto.
// ============================================================================

import { useState } from 'react';

const CONTACT_EMAIL = 'support@medal-battle.example'; // להחליף לכתובת האמיתית

export default function ContactPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const subject = encodeURIComponent(`פנייה מקרב המדליה מאת ${name || 'שחקנית'}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="lobby__section contact-page">
      <h2 className="lobby__section-title">צור קשר</h2>
      <p className="contact-page__hint">יש הצעה, באג, או רעיון למשחק נוסף? נשמח לשמוע.</p>

      <form className="join-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>השם שלך</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="אופציונלי" />
        </label>

        <label className="field">
          <span>ההודעה</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            placeholder="ספרי לנו מה קרה או מה היית רוצה לראות באתר"
          />
        </label>

        <button className="btn btn--primary" type="submit">שליחה במייל</button>
      </form>
    </section>
  );
}
