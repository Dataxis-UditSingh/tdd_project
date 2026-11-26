
import 'dotenv/config';
import '../../instrumentation.js';

import { orderApp } from './app.js';
import { logger } from '../../logger.js';

const PORT = Number(process.env.PORT ?? 4101);

const server = orderApp.listen(PORT, () => {
  logger.info(`Order Service started on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
});
