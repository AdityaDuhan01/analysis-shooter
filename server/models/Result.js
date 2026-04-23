import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  score: { type: Number, required: true },
  totalTargets: { type: Number, required: true },
  hits: { type: Number, required: true },
  misses: { type: Number, required: true },
  accuracy: { type: Number, required: true },        // hits / totalTargets * 100
  avgReactionTime: { type: Number, required: true }, // ms
  playedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Result', resultSchema);