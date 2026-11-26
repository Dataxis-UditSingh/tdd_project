
import 'dotenv/config';
import '../../instrumentation.js';

import { inventoryApp } from './app.js';
import { logger } from '../../logger.js';

const PORT = Number(process.env.PORT ?? 4102);

const server = inventoryApp.listen(PORT, () => {
  logger.info(`Inventory Service started on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
});
