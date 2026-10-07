import express from 'express';
import cors from 'cors';
import { challenges } from './data.js';
import { requestLogger } from './middleware/request-logger.js';

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";


export const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Check backend health
 *     responses:
 *       200:
 *         description: Backend is healthy
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @openapi
 * /api/challenges:
 *   get:
 *     tags: [Challenges]
 *     summary: List challenges
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter challenges by difficulty
 *     responses:
 *       200:
 *         description: Challenge collection
 */
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

/**
 * @openapi
 * /api/challenges/{id}:
 *   get:
 *     tags: [Challenges]
 *     summary: Get a challenge by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenge found
 *       404:
 *         description: Challenge not found
 */
app.get('/api/challenges/:id', (req, res) => {
  const challenge = challenges.find((item) => item.id === req.params.id);

  if (!challenge) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  return res.json(challenge);
});
