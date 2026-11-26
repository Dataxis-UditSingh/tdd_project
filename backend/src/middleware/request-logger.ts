import type { NextFunction, Request, Response } from 'express';
import { logger } from '../logger.js';
import { recordHttpRequest } from '../metrics.js';

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

    const routePath =
      typeof req.route?.path === 'string'
        ? `${req.baseUrl}${req.route.path}`
        : req.path;

    recordHttpRequest(
      req.method,
      routePath,
      res.statusCode,
      durationMs,
    );

    const logMessage =
      `HTTP request completed: ${req.method} ${req.originalUrl} ` +
      `status=${res.statusCode} durationMs=${durationMs}`;

    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
}