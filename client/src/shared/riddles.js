// ============================================================================
//  riddles.js — מאגר החידות הקשות למסך "אתגר המדליה"
// ============================================================================

const RIDDLES_HANDWRITTEN = [
  { q: 'מה יש לים ואין להר?', options: ['חול', 'גלים', 'מלח', 'דגים'], correct: 1 },
  { q: 'מהי המילה שהופכת לקצרה יותר כשמוסיפים לה אותיות?', options: ['קצרה', 'ארוכה', 'שקטה', 'ריקה'], correct: 0 },
  { q: 'מה ניתן לשבור מבלי לגעת בו כלל?', options: ['הבטחה', 'זכוכית', 'עץ', 'עיפרון'], correct: 0 },
  { q: 'מה יש לשעון ואין לספר?', options: ['מחוגים', 'דפים', 'כריכה', 'כותרת'], correct: 0 },
  { q: 'באיזה חודש יש 28 ימים?', options: ['רק בפברואר', 'בכל החודשים', 'בינואר', 'אין כזה חודש'], correct: 1 },
  { q: 'מה תמיד מגיע לפני ה"סוף" אך לעולם לא מסתיים?', options: ['ההתחלה', 'האמצע', 'הסיפור', 'הזמן'], correct: 3 },
  { q: 'מה ניתן להחזיק ביד שמאל אך לעולם לא ביד ימין?', options: ['את יד ימין', 'ספר', 'כוס', 'מפתח'], correct: 0 },
  { q: 'איזו מילה בעברית מכילה בתוכה את כל חמשת התנועות (a-e-i-o-u)?', options: ['תרנגולת אינה', 'משפט ארוך', 'אין מילה כזו', 'שולחן'], correct: 2 },
  { q: 'מה תמיד יורד אך לעולם אינו עולה בכוחות עצמו?', options: ['גשם', 'שמש', 'ירח', 'רוח'], correct: 0 },
  { q: 'לאדם יש שתיים, לעכביש שמונה, לתרנגול שתיים ולכלב ארבע — מה זה?', options: ['אוזניים', 'רגליים', 'עיניים', 'שיניים'], correct: 1 },
  { q: 'מה הולך וגדל ככל שלוקחים ממנו יותר?', options: ['בור', 'חוב', 'עוגה', 'כסף'], correct: 0 },
  { q: 'למה יש מפתחות רבים אך הוא אינו מסוגל לפתוח דלתות?', options: ['פסנתר', 'ארון', 'רכב', 'תיבת דואר'], correct: 0 },
  { q: 'מה ניתן לתפוס אך לא ניתן לזרוק?', options: ['הזדמנות', 'כדור', 'חבל', 'רשת'], correct: 0 },
  { q: 'מה נשאר בתוך הכיס גם לאחר שמרוקנים אותו לחלוטין?', options: ['חור', 'אבק', 'קמט', 'ריח'], correct: 0 },
  { q: 'מהי המילה בת 5 האותיות שמשמעותה אינה משתנה גם בקריאה הפוכה?', options: ['רדר', 'מדד', 'שקד', 'מנוף'], correct: 0 },
  { q: 'באיזה חדר אין קירות ואין דלתות?', options: ['חדר כושר', 'חדר בפטריה', 'פטריה', 'חדר בבית'], correct: 1 },
  { q: 'מה ניתן לשבור בעזרת מילה אחת בלבד?', options: ['שתיקה', 'כוס', 'לב', 'ענף'], correct: 0 },
  { q: 'מה תמיד בדרך להגיע, אך לעולם לא באמת כאן?', options: ['מחר', 'הערב', 'סוף השבוע', 'החג'], correct: 0 },
  { q: 'מה תמצאו בספר אך לעולם לא בעיתון?', options: ['פרקים', 'עמודים', 'תמונות', 'כותרת'], correct: 0 },
  { q: 'לאיזה עץ אין ענפים ועלים אך יש לו גזע מפואר?', options: ['עץ משפחה', 'עץ זית', 'ברוש', 'אלון'], correct: 0 },
];

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
    const useSequence = i % 4 === 3; 
    if (useSequence) {
      const start = 2 + Math.floor(rand() * 8);
      const step = 2 + Math.floor(rand() * 6);
      const grow = i % 8 === 7; 
      const seq = [start];
      for (let k = 1; k < 5; k++) {
        seq.push(seq[k - 1] + step + (grow ? k : 0));
      }
      const answer = seq[4];
      const wrong = [answer + step, answer - step, answer + 1].filter((n) => n !== answer);
      bank.push({
        q: `מהו המספר הבא בסדרה: ${seq.slice(0, 4).join(', ')}, ?`,
        ...shuffleWithAnswer(answer, wrong, rand),
      });
    } else {
      const a = 4 + Math.floor(rand() * 16);
      const b = 2 + Math.floor(rand() * 12);
      const c = 2 + Math.floor(rand() * 9);
      const op = i % 3;
      let question, answer;
      if (op === 0) { question = `מהי התוצאה של ${a} × ${b} − ${c}?`; answer = a * b - c; }
      else if (op === 1) { question = `מהי התוצאה של (${a} + ${b}) × ${c}?`; answer = (a + b) * c; }
      else { question = `מהי התוצאה של ${a * b} ÷ ${b} + ${c}?`; answer = a + c; }
      const wrong = [answer + c, answer - b, answer + b].filter((n) => n !== answer);
      bank.push({ q: question, ...shuffleWithAnswer(answer, wrong, rand) });
    }
  }
  return bank;
}

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

export const RIDDLES = buildBank();

export function pickUnusedRiddle(usedIds = []) {
  const usedSet = new Set(usedIds);
  const available = RIDDLES.filter((r) => !usedSet.has(r.id));
  const pool = available.length > 0 ? available : RIDDLES; 
  return pool[Math.floor(Math.random() * pool.length)];
}