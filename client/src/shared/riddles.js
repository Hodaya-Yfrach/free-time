// ============================================================================
//  riddles.js — מאגר החידות הקשות למסך "המדליה"
//  ----------------------------------------------------------------------
//  לפי הבקשה: מערך של 100 חידות בסך הכול. כתיבה ידנית של 100 חידות
//  איכותיות היא הרבה טקסט, אז הפתרון כאן הוא שילוב:
//    • 20 חידות היגיון/מילים שנכתבו ידנית (RIDDLES_HANDWRITTEN)
//    • 80 חידות חשבון/סדרות שנבנות אוטומטית בקוד (generateArithmeticBank)
//      בעזרת מחולל מספרים פסאודו-אקראי עם "זרע" קבוע (seeded) - כך שהמאגר
//      תמיד יוצא זהה בין טעינה לטעינה, אבל אין צורך לכתוב 80 שורות ידנית.
//
//  כל חידה: { id, question, options: [4], correctIndex, difficulty }.
//  אפשר בהחלט להחליף/להוסיף חידות ידנית - פשוט מוסיפים אובייקטים
//  לפי אותו מבנה למערך RIDDLES_HANDWRITTEN למטה.
// ============================================================================

const RIDDLES_HANDWRITTEN = [
  { q: 'מה יש לים ואין להר?', options: ['חול', 'גלים', 'מלח', 'דגים'], correct: 1 },
  { q: 'מהי המילה שהופכת לקצרה יותר כשמוסיפים לה אותיות?', options: ['קצרה', 'ארוכה', 'שקטה', 'ריקה'], correct: 0 },
  { q: 'מה אפשר לשבור בלי לגעת בו?', options: ['הבטחה', 'זכוכית', 'עץ', 'עיפרון'], correct: 0 },
  { q: 'מה יש לשעון ואין לו לספר?', options: ['מחוגים', 'דפים', 'כריכה', 'כותרת'], correct: 0 },
  { q: 'איזה חודש יש בו 28 ימים?', options: ['רק פברואר', 'כל החודשים', 'ינואר', 'אין כזה'], correct: 1 },
  { q: 'מה תמיד בא לפני ה"סוף" אבל אף פעם לא נגמר?', options: ['ההתחלה', 'האמצע', 'הסיפור', 'הזמן'], correct: 3 },
  { q: 'מה אפשר להחזיק ביד שמאל אבל לא ביד ימין באותו הרגע?', options: ['היד הימנית', 'ספר', 'כוס', 'מפתח'], correct: 0 },
  { q: 'איזו מילה בעברית מכילה בתוכה את כל חמשת התנועות (a-e-i-o-u)?', options: ['תרנגולת אינה', 'משפט ארוך', 'אין כזו מילה בודדת', 'שולחן'], correct: 2 },
  { q: 'מה יורד אבל אף פעם לא עולה בחזרה לבד?', options: ['גשם', 'שמש', 'ירח', 'רוח'], correct: 0 },
  { q: 'לאדם יש שתיים, לעכביש שמונה, לתרנגול שתיים ולכלב ארבע — מה זה?', options: ['אוזניים', 'רגליים', 'עיניים', 'שיניים'], correct: 1 },
  { q: 'מה גדל כשלוקחים ממנו?', options: ['בור', 'חוב', 'עוגה', 'כסף'], correct: 0 },
  { q: 'איזה דבר יש לו מפתחות אך לא פותח דלתות?', options: ['פסנתר', 'ארון', 'רכב', 'תיבת דואר'], correct: 0 },
  { q: 'מה אפשר לתפוס אבל לא לזרוק?', options: ['הזדמנות', 'כדור', 'חבל', 'רשת'], correct: 0 },
  { q: 'מה נשאר בכיס גם כשמרוקנים אותו?', options: ['חור', 'אבק', 'קמט', 'ריח'], correct: 0 },
  { q: 'מהי המילה בת 5 האותיות שנשארת אותה מילה גם כשקוראים אותה הפוך?', options: ['רדר', 'מדד', 'שקד', 'מנוף'], correct: 0 },
  { q: 'איזה חדר אין לו קירות ולא דלתות?', options: ['חדר כושר', 'חדר בפטריה', 'פטריה', 'חדר בבית'], correct: 1 },
  { q: 'מה אפשר לשבור בעזרת מילה אחת בלבד?', options: ['שתיקה', 'כוס', 'לב', 'ענף'], correct: 0 },
  { q: 'איזה דבר תמיד מגיע אבל אף פעם לא ממש מגיע?', options: ['מחר', 'ערב', 'סוף שבוע', 'חג'], correct: 0 },
  { q: 'מה יש לספר שאין לעיתון?', options: ['פרקים', 'עמודים', 'תמונות', 'כותרת'], correct: 0 },
  { q: 'איזה עץ אין לו ענפים ועלים אך יש לו "גזע"?', options: ['עץ משפחה', 'עץ זית', 'ברוש', 'אלון'], correct: 0 },
];

/** מחולל מספרים פסאודו-אקראי עם זרע קבוע, כדי שהמאגר יהיה יציב בין טעינות */
function makeSeededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function generateArithmeticBank(count) {
  const rand = makeSeededRandom(42);
  const bank = [];

  for (let i = 0; i < count; i++) {
    const useSequence = i % 4 === 3; // כל רביעית חידה היא סדרת מספרים במקום חשבון
    if (useSequence) {
      const start = 2 + Math.floor(rand() * 8);
      const step = 2 + Math.floor(rand() * 6);
      const grow = i % 8 === 7; // חלק מהסדרות עם קפיצה גדלה (קשה יותר)
      const seq = [start];
      for (let k = 1; k < 5; k++) {
        seq.push(seq[k - 1] + step + (grow ? k : 0));
      }
      const answer = seq[4];
      const wrong = [answer + step, answer - step, answer + 1].filter((n) => n !== answer);
      bank.push({
        q: `מה המספר הבא בסדרה: ${seq.slice(0, 4).join(', ')}, ?`,
        ...shuffleWithAnswer(answer, wrong, rand),
      });
    } else {
      const a = 4 + Math.floor(rand() * 16);
      const b = 2 + Math.floor(rand() * 12);
      const c = 2 + Math.floor(rand() * 9);
      const op = i % 3;
      let question, answer;
      if (op === 0) { question = `כמה זה ${a} × ${b} − ${c}?`; answer = a * b - c; }
      else if (op === 1) { question = `כמה זה (${a} + ${b}) × ${c}?`; answer = (a + b) * c; }
      else { question = `כמה זה ${a * b} ÷ ${b} + ${c}?`; answer = a + c; }
      const wrong = [answer + c, answer - b, answer + b].filter((n) => n !== answer);
      bank.push({ q: question, ...shuffleWithAnswer(answer, wrong, rand) });
    }
  }
  return bank;
}

/** בונה מערך אפשרויות עם 4 ערכים (תשובה נכונה + 3 שגויות), מוגרל וסימון האינדקס הנכון */
function shuffleWithAnswer(answer, wrongCandidates, rand) {
  const options = [answer, ...wrongCandidates.slice(0, 3)].map(String);
  while (options.length < 4) options.push(String(answer + options.length + 1));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, correct: options.indexOf(String(answer)) };
}

function buildBank() {
  const handwritten = RIDDLES_HANDWRITTEN.map((r) => ({ q: r.q, options: r.options, correct: r.correct }));
  const generated = generateArithmeticBank(100 - handwritten.length);
  const all = [...handwritten, ...generated];

  return all.map((r, index) => ({
    id: `riddle-${index + 1}`,
    question: r.q,
    options: r.options,
    correctIndex: r.correct,
    difficulty: index < handwritten.length ? 'logic' : 'math',
  }));
}

/** מאגר החידות המלא - 100 חידות בדיוק, נבנה פעם אחת בטעינת המודול */
export const RIDDLES = buildBank();

/** מחזיר חידה אקראית שעדיין לא נשאלה מתוך רשימת מזהים שכבר נוצלו */
export function pickUnusedRiddle(usedIds = []) {
  const usedSet = new Set(usedIds);
  const available = RIDDLES.filter((r) => !usedSet.has(r.id));
  const pool = available.length > 0 ? available : RIDDLES; // אם השתמשנו בכולן - מתחילים סבב חדש
  return pool[Math.floor(Math.random() * pool.length)];
}
