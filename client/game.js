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
const finalLeaderboardEl = document.getElementById('finalLeaderboard');
const playAgainBtn = document.getElementById('playAgainBtn');
const leaderboardEl = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboardList');

let playerName = '';
let score = 0;
let targets = [];
let gameRunning = false;
let timeLeft = 30;
let spawnInterval = null;
let timerInterval = null;
let reactionTimes = [];
let totalClicks = 0;
let hits = 0;

// visual feedback flashes
let flashes = [];

// --- Socket Events ---

socket.on('updateLeaderboard', (data) => {
  leaderboardList.innerHTML = '';
  data.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `${p.name}: ${p.score}`;
    if (p.name === playerName) li.style.color = '#00ff88';
    leaderboardList.appendChild(li);
  });

  if (!gameRunning && gameOverScreen.style.display === 'flex') {
    finalLeaderboardEl.innerHTML =
      '<strong style="color:#00ff88">Final Standings:</strong><br>' +
      data.map((p, i) => `${i + 1}. ${p.name} — ${p.score}`).join('<br>');
  }
});

// --- Target Logic ---

function spawnTarget() {
  const radius = 30;
  const padding = radius + 10;
  const x = Math.random() * (canvas.width - padding * 2) + padding;
  const y = Math.random() * (canvas.height - padding * 2) + padding;
  targets.push({ x, y, radius, spawnedAt: Date.now() });
}

function drawTargets() {
  targets.forEach(t => {
    // outer ring
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();

    // middle ring
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#ff8888';
    ctx.fill();

    // center dot
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius * 0.3, 0, Math.PI * 2);
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
      return { hit: true, reactionTime, x: t.x, y: t.y };
    }
  }
  return { hit: false };
}

// --- Visual Feedback ---

function addFlash(x, y, isHit) {
  flashes.push({
    x, y,
    text: isHit ? '+1' : 'miss',
    color: isHit ? '#00ff88' : '#ff4444',
    alpha: 1.0,
    dy: -1.5
  });
}

function drawFlashes() {
  flashes = flashes.filter(f => f.alpha > 0);
  flashes.forEach(f => {
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle = f.color;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y);
    f.y += f.dy;
    f.alpha -= 0.03;
  });
  ctx.globalAlpha = 1.0;
}

// --- Timer bar ---

function drawTimerBar() {
  const barWidth = canvas.width - 20;
  const ratio = timeLeft / 30;
  const color = ratio > 0.5 ? '#00ff88' : ratio > 0.25 ? '#ffaa00' : '#ff4444';

  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(10, canvas.height - 14, barWidth, 8);

  ctx.fillStyle = color;
  ctx.fillRect(10, canvas.height - 14, barWidth * ratio, 8);
}

// --- Canvas Click ---

canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  totalClicks++;
  const result = checkHit(mouseX, mouseY);

  if (result.hit) {
    hits++;
    score++;
    reactionTimes.push(result.reactionTime);
    scoreEl.textContent = 'Score: ' + score;
    socket.emit('scored');
    addFlash(result.x, result.y - 10, true);
  } else {
    addFlash(mouseX, mouseY, false);
  }
});

// --- Timer ---

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = 'Time: ' + timeLeft + 's';
    if (timeLeft <= 5) timerEl.style.color = '#ff4444';
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  targets = [];
  flashes = [];

  const misses = totalClicks - hits;
  const accuracy = totalClicks === 0 ? 0
    : Math.round((hits / totalClicks) * 100);
  const avgReactionTime = reactionTimes.length === 0 ? 0
    : Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);

  socket.emit('gameOver', {
    playerName,
    score,
    totalTargets: hits + misses,
    hits,
    misses,
    accuracy,
    avgReactionTime
  });

  finalScoreEl.innerHTML = `
    Your Score: <strong>${score}</strong><br>
    <span style="font-size:14px; color:#aaa">
      Accuracy: ${accuracy}% &nbsp;|&nbsp;
      Avg Reaction: ${avgReactionTime}ms &nbsp;|&nbsp;
      Hits: ${hits} &nbsp;|&nbsp; Misses: ${misses}
    </span>
  `;
  gameOverScreen.style.display = 'flex';
}

// --- Play Again ---

playAgainBtn.addEventListener('click', () => {
  score = 0;
  timeLeft = 30;
  targets = [];
  reactionTimes = [];
  totalClicks = 0;
  hits = 0;
  flashes = [];
  scoreEl.textContent = 'Score: 0';
  timerEl.textContent = 'Time: 30s';
  timerEl.style.color = '#00ff88';
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
  drawFlashes();
  drawTimerBar();
  requestAnimationFrame(gameLoop);
}

function startSpawning() {
  spawnTarget();
  spawnInterval = setInterval(() => {
    if (targets.length < 5) spawnTarget();
  }, 1200);
}

// --- Join ---

function startGame() {
  playerName = nameInput.value.trim();
  if (!playerName) {
    alert('Enter a name first');
    return;
  }

  joinScreen.style.display = 'none';
  ui.style.display = 'flex';
  canvas.style.display = 'block';
  leaderboardEl.style.display = 'block';
  playerNameEl.textContent = 'Player: ' + playerName;

  socket.emit('joinGame', playerName);
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