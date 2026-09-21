import { useState } from 'react';

const CONTACT_EMAIL = '8564417@gmail.com';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);

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
    <section className="lobby__section about-page">
      <h2 className="lobby__section-title">אודות קרב המדליה</h2>

      <div className="about-page__body">
        <div className="about-page__card">
          <p>
            קרב המדליה הוא אתר משחקים קטן ותוסס לזמן פנוי - שלושה משחקים
            שונים לגמרי (זיכרון וזריזות, מרוץ מכשולים, ובריחה משודדים),
            כולם בחדר משותף אחד עם לוח תוצאות בזמן אמת.
          </p>
          <p>
            כל שלב מעלה את הקושי בהדרגה, כל תשובה נכונה שווה יותר נקודות
            ככל שמתקדמים, ומדי פעם נפתח אתגר מדליה מיוחד עם חידה קשה
            ופרסים חזותיים לבחירה.
          </p>
          <p>
            האתר נבנה כפרויקט אישי, עם React בצד הלקוח ו-Node.js +
            Socket.IO בצד השרת לתקשורת מהירה ובזמן אמת בין השחקניות באותו חדר.
          </p>
        </div>

        <div className="about-page__contact">
          <span className="about-page__email">{CONTACT_EMAIL}</span>
        </div>

        <div className="about-page__actions">
          <a
            className="about-page__action about-page__action--primary"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('פנייה מקרב המדליה')}`}
          >
            שליחה למייל
          </a>

          <button
            type="button"
            className="about-page__action about-page__action--secondary"
            onClick={handleCopy}
          >
            {copied ? 'הועתק!' : 'העתקת המייל'}
          </button>
        </div>
      </div>
    </section>
  );
}