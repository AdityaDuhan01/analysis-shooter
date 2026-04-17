const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make canvas fill available space below UI bar
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 44;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Draw the arena
function drawArena() {
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Center label
  ctx.fillStyle = '#ffffff22';
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('REACTION ARENA', canvas.width / 2, canvas.height / 2);
}

// Game loop
function gameLoop() {
  drawArena();
  requestAnimationFrame(gameLoop);
}

gameLoop();