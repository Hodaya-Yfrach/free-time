const socket = io();

const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const nameInput = document.getElementById('name-input');
const roomInput = document.getElementById('room-input');
const joinBtn = document.getElementById('join-btn');
const roomLabelCode = document.getElementById('room-label-code');
const leaderboardEl = document.getElementById('leaderboard');
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');
const scoreValue = document.getElementById('score-value');
const levelValue = document.getElementById('level-value');

// שעון טיימר חדש
const clockTimer = document.getElementById('clock-timer');
const clockText = document.getElementById('clock-text');
const toastContainer = document.getElementById('toast-container');

// אנימציית עקיפה
const overtakeScreen = document.getElementById('overtake-screen');
const overtakeName = document.getElementById('overtake-name');

// מסך כישלון חדש
const failScreen = document.getElementById('fail-screen');
const failCountdownEl = document.getElementById('fail-countdown');

const findMissingPanel = document.getElementById('mode-find-missing');
const matchMotionPanel = document.getElementById('mode-match-motion');
const gridFull = document.getElementById('grid-full');
const gridMissing = document.getElementById('grid-missing');
const targetShapeEl = document.getElementById('target-shape');
const optionsRow = document.getElementById('options-row');
const matchRuleTitle = document.getElementById('match-rule-title');

// שלב חדש: התאמת צללית
const matchShadowPanel = document.getElementById('mode-match-shadow');
const shadowTargetEl = document.getElementById('shadow-target-shape');
const shadowOptionsRow = document.getElementById('shadow-options-row');

let myName = '';
let roomCode = '';

let score = 0;
let level = 1;
let pendingLevelScore = 0;
let questionIndex = 0;
const QUESTIONS_PER_LEVEL = 3;

// זמנים דינמיים לפי קושי - הזמן עולה יחד עם כמות הצורות במקום לרדת!
// כך ברמות הקשות (הרבה צורות) יש הרבה יותר זמן לסרוק את הלוח,
// והמשחק נשאר קליל וכיפי גם ברמות גבוהות.
const BASE_TIME_MS = 12000;       // זמן בסיס בשלב הראשון (5 צורות)
const TIME_PER_SHAPE_MS = 1000;   // כל צורה נוספת בלוח מוסיפה שנייה שלמה
const BASE_SHAPE_COUNT = 5;       // כמות הצורות בשלב הראשון
const MAX_TIME_MS = 27000;        // תקרת זמן כדי שלא ימתח יותר מדי
let currentLevelTimeLimit = BASE_TIME_MS;
let timeLeftMs = BASE_TIME_MS;

function timeLimitForLevel(lvl) {
  const shapeCount = shapeCountForLevel(lvl);
  const extraTime = (shapeCount - BASE_SHAPE_COUNT) * TIME_PER_SHAPE_MS;
  return Math.min(MAX_TIME_MS, BASE_TIME_MS + extraTime);
}

let timerInterval = null;
let failCountdownInterval = null;
let overtakeResumeTimeout = null;
const OVERTAKE_FREEZE_MS = 3500; // תואם בדיוק לאורך אנימציית העקיפה ב-CSS
let paused = false;
let awaitingAnswer = false;
let currentMissingCombo = null;

function shapeCountForLevel(lvl) {
  return Math.min(20, lvl + 4); // מותאם ל-20 צורות
}

function allCombos() {
  const combos = [];
  SHAPE_TYPES.forEach((shape) => {
    COLOR_PALETTE.forEach((color) => {
      combos.push({ shape, color });
    });
  });
  return combos;
}

function sameCombo(a, b) {
  return a.shape === b.shape && a.color === b.color;
}

joinBtn.addEventListener('click', () => {
  myName = nameInput.value.trim() || 'שחקנית';
  roomCode = (roomInput.value.trim() || 'DEFAULT').toUpperCase();
  socket.emit('join-room', { roomCode, name: myName });
});

socket.on('room-joined', ({ roomCode: rc, players }) => {
  roomLabelCode.textContent = rc;
  lobbyScreen.classList.remove('active');
  gameScreen.classList.add('active');
  renderLeaderboard(players);
  nextQuestion();
});

socket.on('leaderboard-update', renderLeaderboard);

socket.on('leader-changed', ({ name }) => {
  // הפעלת האנימציה הענקית למרכז המסך!
  overtakeName.innerHTML = `<span class="overtake-highlight">${name}</span> עקפה ולקחה את המדליה!`;

  // מסירים ומחזירים את המחלקה כדי לאתחל את האנימציה אם היא כבר פועלת
  overtakeScreen.classList.remove('active');
  void overtakeScreen.offsetWidth; // מאלץ דפדפן לחשב מחדש את התצוגה
  overtakeScreen.classList.add('active');

  showToast(`🏅 ${name} עקפה ולקחה את המדליה!`, 'leader');

  // באג שתוקן: מסך העקיפה חוסם את כל המסך ל-3.5 שניות, אבל הטיימר
  // המשיך לרוץ מתחתיו - כך שכשהאנימציה נגמרת השחקנית כבר "איחרה"
  // בלי שהייתה לה בכלל אפשרות ללחוץ על משהו. עכשיו עוצרים את הטיימר
  // בדיוק לאורך זמן האנימציה, וממשיכים אותו בדיוק מאיפה שהוא עצר.
  freezeTimerForOvertake();
});

function freezeTimerForOvertake() {
  if (awaitingAnswer && !paused) {
    clearInterval(timerInterval);
  }
  clearTimeout(overtakeResumeTimeout);
  overtakeResumeTimeout = setTimeout(() => {
    if (awaitingAnswer && !paused) {
      startTimer();
    }
  }, OVERTAKE_FREEZE_MS);
}

socket.on('level-up', ({ name, level: lvl }) => {
  if (name !== myName) {
    showToast(`⬆️ ${name} עברה לשלב ${lvl}!`, 'level');
  }
});

socket.on('player-joined', ({ name }) => {
  showToast(`${name} הצטרפה למשחק`, 'info');
});

socket.on('player-left', ({ name }) => {
  showToast(`${name} עזבה את המשחק`, 'info');
});

socket.on('player-paused', ({ name, paused: isPaused }) => {
  if (name !== myName) {
    showToast(isPaused ? `⏸ ${name} בהשהיה` : `▶️ ${name} חזרה למשחק`, 'info');
  }
});

function renderLeaderboard(players) {
  leaderboardEl.innerHTML = '';
  players.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'leaderboard-item' + (idx === 0 && p.score > 0 ? ' leader' : '');
    li.innerHTML = `
      <span class="lb-medal">${idx === 0 && p.score > 0 ? '🏅' : ''}</span>
      <span class="lb-name">${p.name}${p.paused ? ' ⏸' : ''}</span>
      <span class="lb-score">${p.score}</span>
    `;
    leaderboardEl.appendChild(li);
  });
}

function showToast(text, type) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = text;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('toast-out'), 2600);
  setTimeout(() => toast.remove(), 3000);
}

function updateHud() {
  scoreValue.textContent = score;
  levelValue.textContent = level;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeftMs -= 100;

    // הצגת שעון העצר בפורמט שניות עשרוני
    const secsLeft = Math.max(0, timeLeftMs / 1000).toFixed(1);
    clockText.textContent = secsLeft;

    // אם נשארו 3 שניות או פחות - השעון מהבהב באדום
    if (timeLeftMs <= 3000) {
      clockTimer.classList.add('clock-urgent');
    } else {
      clockTimer.classList.remove('clock-urgent');
    }

    if (timeLeftMs <= 0) {
      clearInterval(timerInterval);
      failLevel();
    }
  }, 100);
}

function nextQuestion() {
  clearTimeout(overtakeResumeTimeout);
  questionIndex++;
  if (questionIndex > QUESTIONS_PER_LEVEL) {
    score += pendingLevelScore;
    level++;
    pendingLevelScore = 0;
    questionIndex = 1;
    updateHud();
    socket.emit('score-update', { score, level });
    showToast(`🎉 עברת לשלב ${level}!`, 'level');
  }

  updateHud();

  // חישוב זמן השלב: יותר צורות בלוח = יותר זמן לחשוב, כדי שהמשחק יישאר כיפי
  currentLevelTimeLimit = timeLimitForLevel(level);
  timeLeftMs = currentLevelTimeLimit;

  clockText.textContent = (timeLeftMs / 1000).toFixed(1);
  clockTimer.classList.remove('clock-urgent');
  awaitingAnswer = true;

  // סוג השאלות מתחלף כל שלב במחזור של 3: חסר צורה -> התאמת תנועה -> התאמת צללית
  const modeCycle = ['find-missing', 'match-motion', 'match-shadow'];
  const mode = modeCycle[(level - 1) % modeCycle.length];

  findMissingPanel.classList.remove('active');
  matchMotionPanel.classList.remove('active');
  matchShadowPanel.classList.remove('active');

  if (mode === 'find-missing') {
    findMissingPanel.classList.add('active');
    renderFindMissing();
  } else if (mode === 'match-motion') {
    matchMotionPanel.classList.add('active');
    renderMatchMotion();
  } else {
    matchShadowPanel.classList.add('active');
    renderMatchShadow();
  }

  startTimer();
}

function renderFindMissing() {
  const shapeCount = shapeCountForLevel(level);
  const combos = shuffle(allCombos()).slice(0, shapeCount);
  const missingIdx = Math.floor(Math.random() * combos.length);
  currentMissingCombo = combos[missingIdx];

  gridFull.innerHTML = '';
  combos.forEach((combo) => {
    const cell = document.createElement('div');
    cell.className = 'shape-cell';
    cell.innerHTML = shapeSvg(combo.shape, combo.color, 56);
    cell.addEventListener('click', () => {
      if (!awaitingAnswer) return;
      handleAnswer(sameCombo(combo, currentMissingCombo));
    });
    gridFull.appendChild(cell);
  });

  const remaining = shuffle(combos.filter((c) => !sameCombo(c, currentMissingCombo)));
  gridMissing.innerHTML = '';
  remaining.forEach((combo) => {
    const cell = document.createElement('div');
    cell.className = 'shape-cell static';
    cell.innerHTML = shapeSvg(combo.shape, combo.color, 56);
    gridMissing.appendChild(cell);
  });
}

function renderMatchMotion() {
  const shapeCount = shapeCountForLevel(level);
  const pool = shuffle(SHAPE_TYPES).slice(0, shapeCount);
  const rule = Math.random() < 0.5 ? 'shape' : 'color';
  matchRuleTitle.textContent = rule === 'shape' ? 'התאימו לפי סוג המאכל (הצבע לא משנה)' : 'התאימו לפי צבע (סוג המאכל לא משנה)';

  const target = { shape: randomItem(pool), color: randomItem(COLOR_PALETTE) };
  targetShapeEl.innerHTML = shapeSvg(target.shape, target.color, 80);

  const correctOption = rule === 'shape'
    ? { shape: target.shape, color: randomItem(COLOR_PALETTE.filter((c) => c !== target.color)) }
    : { shape: randomItem(pool.filter((s) => s !== target.shape)), color: target.color };

  const options = [correctOption];
  let attempts = 0;
  while (options.length < 4 && attempts < 300) {
    attempts++;
    const candidate = { shape: randomItem(pool), color: randomItem(COLOR_PALETTE) };
    const matchesRule = rule === 'shape' ? candidate.shape === target.shape : candidate.color === target.color;
    const duplicate = options.some((o) => sameCombo(o, candidate));
    if (!matchesRule && !duplicate) options.push(candidate);
  }
  // רשת ביטחון: במקרה קצה שבו לא נמצאו מספיק אפשרויות שונות
  // (למשל מעט מאוד צורות בשלב נמוך), משלימים בלי לאפשר שני ריבועים זהים
  while (options.length < 4) {
    const fallback = { shape: randomItem(pool), color: randomItem(COLOR_PALETTE) };
    if (!options.some((o) => sameCombo(o, fallback))) options.push(fallback);
  }

  optionsRow.innerHTML = '';
  shuffle(options).forEach((opt) => {
    const cell = document.createElement('div');
    cell.className = 'shape-cell option-cell';
    cell.innerHTML = shapeSvg(opt.shape, opt.color, 60);
    cell.addEventListener('click', () => {
      if (!awaitingAnswer) return;
      const isCorrect = rule === 'shape' ? opt.shape === target.shape : opt.color === target.color;
      handleAnswer(isCorrect);
    });
    optionsRow.appendChild(cell);
  });
}

// שלב חדש: התאמת צללית
// מוצגת צורה צבעונית מלאה, ולמטה 4 צלליות כהות (אותה צורה, בלי צבע) -
// צריך למצוא את הצללית ששייכת לאותו סוג מאכל כמו הצורה שלמעלה.
function renderMatchShadow() {
  const shapeCount = Math.max(4, shapeCountForLevel(level));
  const pool = shuffle(SHAPE_TYPES).slice(0, Math.min(shapeCount, SHAPE_TYPES.length));

  const targetShape = randomItem(pool);
  const targetColor = randomItem(COLOR_PALETTE);
  shadowTargetEl.innerHTML = shapeSvg(targetShape, targetColor, 80);

  // הצללית מוצגת בגוון כהה אחיד - רק הצורה חשובה, לא הצבע
  const SHADOW_COLOR = '#1e293b';
  const wrongShapes = shuffle(pool.filter((s) => s !== targetShape)).slice(0, 3);
  const options = shuffle([targetShape, ...wrongShapes]);

  shadowOptionsRow.innerHTML = '';
  options.forEach((shapeType) => {
    const cell = document.createElement('div');
    cell.className = 'shape-cell option-cell';
    cell.innerHTML = shapeSvg(shapeType, SHADOW_COLOR, 60);
    cell.addEventListener('click', () => {
      if (!awaitingAnswer) return;
      handleAnswer(shapeType === targetShape);
    });
    shadowOptionsRow.appendChild(cell);
  });
}

function handleAnswer(isCorrect) {
  if (!awaitingAnswer) return;
  awaitingAnswer = false;
  clearInterval(timerInterval);

  if (isCorrect) {
    // ניקוד קופצני וכיפי: השניות שנשארו בטיימר, כפול 2 -
    // ככל שעונים מהר יותר, הניקוד קופץ הרבה יותר גבוה!
    const secondsLeft = Math.max(0, timeLeftMs / 1000);
    const points = Math.max(2, Math.round(secondsLeft * 2));
    pendingLevelScore += points;
    nextQuestion();
  } else {
    failLevel();
  }
}

function failLevel() {
  awaitingAnswer = false;
  clearInterval(timerInterval);
  clearTimeout(overtakeResumeTimeout);

  // גם בטעות מקבלים "נחמה" קטנה של 2 נקודות במקום לאבד הכל -
  // פחות מתסכל, יותר כיף להמשיך לשחק
  score += 2;
  updateHud();
  socket.emit('score-update', { score, level });

  pendingLevelScore = 0;
  questionIndex = 0; // מתחיל את השלב מאפס השאלות
  showFailScreen();
}

// מציג מסך כישלון עם פרצוף עצוב והשהיה של 5 שניות
// לפני שחוזרים אוטומטית לשלב מחדש
function showFailScreen() {
  clearInterval(failCountdownInterval);
  let secondsLeft = 5;
  failCountdownEl.textContent = secondsLeft;
  failScreen.classList.add('active');

  failCountdownInterval = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      clearInterval(failCountdownInterval);
      failScreen.classList.remove('active');
      nextQuestion();
    } else {
      failCountdownEl.textContent = secondsLeft;
    }
  }, 1000);
}

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  const pauseFill = document.getElementById('pause-progress-fill');
  const pauseLevelTxt = document.getElementById('pause-level-txt');

  if (paused) {
    clearInterval(timerInterval);
    clearTimeout(overtakeResumeTimeout);
    pauseOverlay.classList.add('active');
    pauseBtn.textContent = '▶ חזרה למשחק';

    // מעדכן את הנתונים במסך ההשהיה המסתיר
    pauseLevelTxt.textContent = level;
    pauseFill.style.width = ((questionIndex - 1) / QUESTIONS_PER_LEVEL * 100) + '%';

  } else {
    pauseOverlay.classList.remove('active');
    pauseBtn.textContent = '⏸ השהיה';
    if (awaitingAnswer) startTimer();
  }
  socket.emit('pause-toggle', { paused });
});
