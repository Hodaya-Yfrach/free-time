import { useState } from 'react';

const CONTACT_EMAIL = '8564417@gmail.com';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const subject = encodeURIComponent(`פנייה מקרב המדליה מאת ${name || 'שחקנית'}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="lobby__section contact-page">
      <h2 className="lobby__section-title">יצירת קשר</h2>
      <p className="contact-page__hint">יש לך הצעת ייעול, דיווח על באג, או רעיון למשחק נוסף? נשמח לשמוע!</p>

      <div className="contact-page__email-box">
        <span>מייל:</span>
        <strong>{CONTACT_EMAIL}</strong>
        <button type="button" className="contact-page__copy" onClick={handleCopy}>
          {copied ? 'הועתק!' : 'העתקת המייל'}
        </button>
      </div>

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