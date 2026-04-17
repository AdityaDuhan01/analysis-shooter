const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const joinScreen = document.getElementById('joinScreen');
const ui = document.getElementById('ui');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('nameInput');
const playerNameEl = document.getElementById('playerName');

let playerName = '';

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
  ctx.fillStyle = '#ffffff22';
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('REACTION ARENA', canvas.width / 2, canvas.height / 2);
}

function gameLoop() {
  drawArena();
  requestAnimationFrame(gameLoop);
}

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
  gameLoop();
}

joinBtn.addEventListener('click', startGame);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startGame();
});