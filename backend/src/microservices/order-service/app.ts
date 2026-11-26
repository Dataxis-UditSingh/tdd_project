
import express from 'express';
import { randomUUID } from 'node:crypto';
import { requestLogger } from '../../middleware/request-logger.js';
import { logger } from '../../logger.js';
import { logServiceConnection } from '../../observability/connection-logger.js';

export const orderApp = express();

orderApp.use(express.json());
orderApp.use(requestLogger);

const inventoryServiceUrl =
  process.env.INVENTORY_SERVICE_URL ??
  'http://localhost:4102';

orderApp.get('/health', (_req, res) => {
  res.json({
    service: 'order-service',
    status: 'ok',
  });
});

orderApp.post('/api/orders', async (req, res) => {
  const startedAt = Date.now();
  const requestId =
    req.header('x-request-id') ?? randomUUID();

  const productId = String(req.body?.productId ?? 'product-001');
  const quantity = Number(req.body?.quantity ?? 1);

  try {
    const response = await fetch(
      `${inventoryServiceUrl}/api/inventory/${encodeURIComponent(productId)}`,
      {
        headers: {
          'x-request-id': requestId,
        },
      },
    );

    const inventory = await response.json() as {
      available: boolean;
      quantity: number;
    };

    logServiceConnection({
      sourceService: 'order-service',
      destinationService: 'inventory-service',
      method: 'GET',
      route: '/api/inventory/:productId',
      statusCode: response.status,
      durationMs: Date.now() - startedAt,
      requestId,
    });

    if (!response.ok) {
      return res.status(502).json({
        message: 'Inventory service request failed',
      });
    }

    if (!inventory.available || inventory.quantity < quantity) {
      return res.status(409).json({
        message: 'Insufficient inventory',
      });
    }

    return res.status(201).json({
      orderId: randomUUID(),
      productId,
      quantity,
      status: 'created',
      inventory,
    });
  } catch (error) {
    logServiceConnection({
      sourceService: 'order-service',
      destinationService: 'inventory-service',
      method: 'GET',
      route: '/api/inventory/:productId',
      statusCode: 503,
      durationMs: Date.now() - startedAt,
      requestId,
    });

    logger.error('Inventory service unavailable');

    return res.status(503).json({
      message: 'Inventory service unavailable',
    });
  }
});
