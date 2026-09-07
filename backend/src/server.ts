import './instrumentation.js';
import { app } from './app.js';
import { logger } from './logger.js';

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  logger.info(`TDD API started on http://localhost:${PORT}`);
});