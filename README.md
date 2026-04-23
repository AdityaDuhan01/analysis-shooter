# Real-Time Reaction Performance Analysis System

A multiplayer 2D browser game where players compete by clicking targets as fast as possible. The system tracks and analyzes reaction time, accuracy, and performance after each game.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript, Canvas API |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Database | MongoDB Atlas + Mongoose |

## Features

- Player name entry and game room joining
- Random target spawning with click detection
- Real-time score sync across all players
- Live leaderboard during gameplay
- 30-second countdown timer with visual bar
- Hit/miss visual feedback
- Game over screen with personal stats
- Analytics dashboard with historical results
- Accuracy and average reaction time tracking

## Project Structure
reaction-analysis/
├── client/
│   ├── index.html       # Main game page
│   ├── game.js          # All game logic
│   ├── style.css        # Game styles
│   ├── analytics.html   # Analytics dashboard
│   ├── analytics.js     # Dashboard logic
│   └── analytics.css    # Dashboard styles
├── server/
│   ├── index.js         # Express + Socket.io server
│   ├── db.js            # MongoDB connection
│   └── models/
│       └── Result.js    # Game result schema
├── .env                 # Environment variables (not committed)
├── .gitignore
└── package.json

## Setup Instructions

1. Clone the repository
2. Install dependencies
```bash
npm install
```
3. Create a `.env` file in the root
PORT=3000
MONGO_URI=your_mongodb_connection_string
4. Start the server
```bash
node server/index.js
```
5. Open `http://localhost:3000` in your browser

## How to Play
1. Enter your name and click **Join Game**
2. Click the red targets as fast as possible
3. Game lasts **30 seconds**
4. View your accuracy and reaction time on the game over screen
5. Check `/analytics` for historical performance data

## Team
- Aditya Duhan — Full Stack Development (backend, real-time multiplayer, database, game logic)
- Vikash Yadav — Frontend UI, analytics dashboard, documentation and testing
