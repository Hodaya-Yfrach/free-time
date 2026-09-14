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

const findMissingPanel = document.getElementById('mode-find-missing');
const matchMotionPanel = document.getElementById('mode-match-motion');
const gridFull = document.getElementById('grid-full');
const gridMissing = document.getElementById('grid-missing');
const targetShapeEl = document.getElementById('target-shape');
const optionsRow = document.getElementById('options-row');
const matchRuleTitle = document.getElementById('match-rule-title');

let myName = '';
let roomCode = '';

let score = 0;
let level = 1;
let pendingLevelScore = 0;
let questionIndex = 0;
const QUESTIONS_PER_LEVEL = 3;

// זמנים דינמיים לפי קושי
const BASE_TIME_MS = 8000; // מתחילים קל (8 שניות)
let currentLevelTimeLimit = BASE_TIME_MS;
let timeLeftMs = BASE_TIME_MS;

let timerInterval = null;
let paused = false;
let awaitingAnswer = false;
let currentMissingCombo = null;

function shapeCountForLevel(lvl) {
  return Math.min(10, lvl + 4);
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
  myName = nameInput.value.trim() || 'שחקן';
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
  overtakeName.innerHTML = `<span class="overtake-highlight">${name}</span> עקף ולקח את המדליה!`;
  
  // מסירים ומחזירים את המחלקה כדי לאתחל את האנימציה אם היא כבר פועלת
  overtakeScreen.classList.remove('active');
  void overtakeScreen.offsetWidth; // מאלץ דפדפן לחשב מחדש את התצוגה
  overtakeScreen.classList.add('active');
  
  showToast(`🏅 ${name} עקפה ולקחה את המדליה!`, 'leader');
});

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
    showToast(isPaused ? `⏸ ${name} בשיחה עם לקוח` : `▶️ ${name} חזרה למשחק`, 'info');
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
  
  // חישוב דרגת הקושי: כל שלב יורד הזמן מעט (עד למינימום של 3 שניות)
  currentLevelTimeLimit = Math.max(3000, BASE_TIME_MS - ((level - 1) * 800));
  timeLeftMs = currentLevelTimeLimit;
  
  clockText.textContent = (timeLeftMs / 1000).toFixed(1);
  clockTimer.classList.remove('clock-urgent');
  awaitingAnswer = true;

  // סוג השאלות קבוע לכל השלב (אי-זוגי: חסר צורה, זוגי: התאמת תנועה)
  const mode = (level % 2 === 1) ? 'find-missing' : 'match-motion';
  
  if (mode === 'find-missing') {
    findMissingPanel.classList.add('active');
    matchMotionPanel.classList.remove('active');
    renderFindMissing();
  } else {
    matchMotionPanel.classList.add('active');
    findMissingPanel.classList.remove('active');
    renderMatchMotion();
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
  matchRuleTitle.textContent = rule === 'shape' ? 'התאימו לפי צורה (הצבע לא משנה)' : 'התאימו לפי צבע (הצורה לא משנה)';

  const target = { shape: randomItem(pool), color: randomItem(COLOR_PALETTE) };
  targetShapeEl.innerHTML = shapeSvg(target.shape, target.color, 80);

  const correctOption = rule === 'shape'
    ? { shape: target.shape, color: randomItem(COLOR_PALETTE.filter((c) => c !== target.color)) }
    : { shape: randomItem(pool.filter((s) => s !== target.shape)), color: target.color };

  const options = [correctOption];
  while (options.length < 4) {
    const candidate = { shape: randomItem(pool), color: randomItem(COLOR_PALETTE) };
    const matchesRule = rule === 'shape' ? candidate.shape === target.shape : candidate.color === target.color;
    const duplicate = options.some((o) => sameCombo(o, candidate));
    if (!matchesRule && !duplicate) options.push(candidate);
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

function handleAnswer(isCorrect) {
  if (!awaitingAnswer) return;
  awaitingAnswer = false;
  clearInterval(timerInterval);

  if (isCorrect) {
    // ניקוד יחסי לזמן שעבר מהטיימר הספציפי של השלב
    const reactionSeconds = (currentLevelTimeLimit - timeLeftMs) / 1000;
    const points = Math.max(1, Math.round(7 - reactionSeconds));
    pendingLevelScore += points;
    nextQuestion();
  } else {
    failLevel();
  }
}

function failLevel() {
  awaitingAnswer = false;
  clearInterval(timerInterval);
  pendingLevelScore = 0;
  questionIndex = 0; // מתחיל את השלב מאפס השאלות
  showToast('❌ טעות! מתחילים את השלב מחדש', 'fail');
  nextQuestion();
}

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  const pauseFill = document.getElementById('pause-progress-fill');
  const pauseLevelTxt = document.getElementById('pause-level-txt');

  if (paused) {
    clearInterval(timerInterval);
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