import type { NextFunction, Request, Response } from 'express';
import { logger } from '../logger.js';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startedAt = Date.now();

  logger.info(
    `HTTP request started: ${req.method} ${req.originalUrl}`,
  );

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;

    const logMessage =
      `HTTP request completed: ${req.method} ${req.originalUrl} ` +
      `status=${res.statusCode} durationMs=${durationMs}`;

    if (res.statusCode >= 500) {
      logger.error(logMessage);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn(logMessage);
      return;
    }

    logger.info(logMessage);
  });

  next();
}