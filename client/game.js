const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const joinScreen = document.getElementById('joinScreen');
const ui = document.getElementById('ui');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('nameInput');
const playerNameEl = document.getElementById('playerName');
const scoreEl = document.getElementById('score');

let playerName = '';
let score = 0;
let targets = [];
let gameRunning = false;

// --- Target Logic ---

function spawnTarget() {
  const radius = 30;
  const x = Math.random() * (canvas.width - radius * 2) + radius;
  const y = Math.random() * (canvas.height - radius * 2) + radius;

  targets.push({
    x,
    y,
    radius,
    spawnedAt: Date.now()  // for reaction time tracking later
  });
}

function drawTargets() {
  targets.forEach(t => {
    // Outer ring
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();

    // Inner circle
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
      targets.splice(i, 1);  // remove hit target
      return { hit: true, reactionTime };
    }
  }
  return { hit: false };
}

// --- Canvas Click ---

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

// --- Arena Drawing ---

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

// --- Game Loop ---

function gameLoop() {
  drawArena();
  drawTargets();
  requestAnimationFrame(gameLoop);
}

// --- Spawn Loop ---

let spawnInterval;

function startSpawning() {
  spawnTarget(); // spawn one immediately
  spawnInterval = setInterval(() => {
    if (targets.length < 5) { // max 5 targets at once
      spawnTarget();
    }
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
  gameLoop();
}

joinBtn.addEventListener('click', startGame);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startGame();
});