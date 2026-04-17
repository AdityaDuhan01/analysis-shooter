const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const joinScreen = document.getElementById('joinScreen');
const ui = document.getElementById('ui');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('nameInput');
const playerNameEl = document.getElementById('playerName');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');

let playerName = '';
let score = 0;
let targets = [];
let gameRunning = false;
let timeLeft = 30;
let spawnInterval = null;
let timerInterval = null;

// --- Target Logic ---

function spawnTarget() {
  const radius = 30;
  const x = Math.random() * (canvas.width - radius * 2) + radius;
  const y = Math.random() * (canvas.height - radius * 2) + radius;

  targets.push({
    x, y, radius,
    spawnedAt: Date.now()
  });
}

function drawTargets() {
  targets.forEach(t => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
}

function checkHit(mouseX, mouseY) {
  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    const dist = Math.hypot(mouseX - t.x, mouseY - t.y);
    if (dist <= t.radius) {
      const reactionTime = Date.now() - t.spawnedAt;
      targets.splice(i, 1);
      return { hit: true, reactionTime };
    }
  }
  return { hit: false };
}

canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const result = checkHit(mouseX, mouseY);
  if (result.hit) {
    score++;
    scoreEl.textContent = 'Score: ' + score;
    console.log('Hit! Reaction time:', result.reactionTime, 'ms');
  }
});

// --- Timer Logic ---

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = 'Time: ' + timeLeft + 's';

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  targets = [];

  finalScoreEl.textContent = 'Your Score: ' + score;
  gameOverScreen.style.display = 'flex';
}

// --- Play Again ---

playAgainBtn.addEventListener('click', () => {
  score = 0;
  timeLeft = 30;
  targets = [];
  scoreEl.textContent = 'Score: 0';
  timerEl.textContent = 'Time: 30s';
  gameOverScreen.style.display = 'none';
  gameRunning = true;
  startSpawning();
  startTimer();
});

// --- Arena ---

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 44;
}

function drawArena() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
}

function gameLoop() {
  drawArena();
  drawTargets();
  requestAnimationFrame(gameLoop);
}

// --- Spawn Loop ---

function startSpawning() {
  spawnTarget();
  spawnInterval = setInterval(() => {
    if (targets.length < 5) spawnTarget();
  }, 1200);
}

// --- Join Flow ---

function startGame() {
  playerName = nameInput.value.trim();
  if (!playerName) {
    alert('Enter a name first');
    return;
  }

  joinScreen.style.display = 'none';
  ui.style.display = 'flex';
  canvas.style.display = 'block';
  playerNameEl.textContent = 'Player: ' + playerName;

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  gameRunning = true;
  startSpawning();
  startTimer();
  gameLoop();
}

joinBtn.addEventListener('click', startGame);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startGame();
});