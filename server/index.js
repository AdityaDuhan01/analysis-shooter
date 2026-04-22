import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './db.js';
import Result from './models/Result.js';

dotenv.config();
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(__dirname, '../client')));
app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/analytics.html'));
});
app.use(express.json());

// Store all players
const players = {};

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('joinGame', (name) => {
    players[socket.id] = { name, score: 0 };
    io.emit('updateLeaderboard', getLeaderboard());
  });

  socket.on('scored', () => {
    if (players[socket.id]) {
      players[socket.id].score++;
      io.emit('updateLeaderboard', getLeaderboard());
    }
  });

  // Save result when game ends for this player
  socket.on('gameOver', async (data) => {
    try {
      const result = new Result({
        playerName: data.playerName,
        score: data.score,
        totalTargets: data.totalTargets,
        hits: data.hits,
        misses: data.misses,
        accuracy: data.accuracy,
        avgReactionTime: data.avgReactionTime
      });
      await result.save();
      console.log(`Result saved for ${data.playerName}`);
    } catch (err) {
      console.error('Failed to save result:', err.message);
    }
  });

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

// API to fetch past results
app.get('/api/results', async (req, res) => {
  try {
    const results = await Result.find()
      .sort({ playedAt: -1 })
      .limit(20);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

const PORT = process.env.PORT || 3000;
app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/analytics.html'));
});
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});