import { useState } from 'react';

const CONTACT_EMAIL = 'support@medal-battle.example';

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
      <h2 className="lobby__section-title">יצירת קשר</h2>
      <p className="contact-page__hint">יש לך הצעת ייעול, דיווח על באג, או רעיון למשחק נוסף? נשמח לשמוע!</p>

      <form className="join-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>איך קוראים לך?</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="שם (אופציונלי)" />
        </label>

        <label className="field" style={{ flexBasis: '100%' }}>
          <span>תוכן הפנייה</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
            placeholder="ספרי לנו מה קרה או מה היית רוצה לראות באתר..."
          />
        </label>

        <button className="btn btn--primary" type="submit">שליחה למייל</button>
      </form>
    </section>
  );
}