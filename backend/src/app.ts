import express from 'express';
import cors from 'cors';
import { challenges } from './data.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/challenges', (_req, res) => {
  res.json(challenges);
});

app.get('/api/challenges/:id', (req, res) => {
  const challenge = challenges.find((item) => item.id === req.params.id);

  if (!challenge) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  return res.json(challenge);
});
