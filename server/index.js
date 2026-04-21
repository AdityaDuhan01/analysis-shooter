import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './db.js';

dotenv.config();
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(__dirname, '../client')));

// Store all players: { socketId: { name, score } }
const players = {};

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Player joins with a name
  socket.on('joinGame', (name) => {
    players[socket.id] = { name, score: 0 };
    io.emit('updateLeaderboard', getLeaderboard());
    console.log(`${name} joined`);
  });

  // Player scored a hit
  socket.on('scored', () => {
    if (players[socket.id]) {
      players[socket.id].score++;
      io.emit('updateLeaderboard', getLeaderboard());
    }
  });

  // Player disconnects
  socket.on('disconnect', () => {
    if (players[socket.id]) {
      console.log(`${players[socket.id].name} left`);
      delete players[socket.id];
      io.emit('updateLeaderboard', getLeaderboard());
    }
  });
});

function getLeaderboard() {
  return Object.values(players)
    .sort((a, b) => b.score - a.score);
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});