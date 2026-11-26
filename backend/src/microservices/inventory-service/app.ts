
import express from 'express';
import { requestLogger } from '../../middleware/request-logger.js';

export const inventoryApp = express();

inventoryApp.use(express.json());
inventoryApp.use(requestLogger);

inventoryApp.get('/health', (_req, res) => {
  res.json({
    service: 'inventory-service',
    status: 'ok',
  });
});

inventoryApp.get('/api/inventory/:productId', (req, res) => {
  const { productId } = req.params;

  res.json({
    productId,
    available: true,
    quantity: 100,
    service: 'inventory-service',
  });
});
