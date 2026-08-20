import express from 'express';
import cors from 'cors';
import { challenges } from './data.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/challenges', (req, res) => {
  const { difficulty } = req.query;

  if (!difficulty) {
    return res.json(challenges);
  }

  const filteredChallenges = challenges.filter(
    (challenge) => challenge.difficulty === difficulty,
  );

  return res.json(filteredChallenges);
});

app.get('/api/challenges/:id', (req, res) => {
  const challenge = challenges.find((item) => item.id === req.params.id);

  if (!challenge) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  return res.json(challenge);
});
