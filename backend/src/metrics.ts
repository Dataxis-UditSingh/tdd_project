import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('tdd-backend', '1.0.0');

export const httpRequestCounter = meter.createCounter(
  'tdd.backend.http.requests',
  {
    description: 'Number of backend HTTP requests',
    unit: '{request}',
  },
);

export const httpRequestDuration = meter.createHistogram(
  'tdd.backend.http.request.duration',
  {
    description: 'Backend HTTP request duration',
    unit: 'ms',
  },
);

export const httpErrorCounter = meter.createCounter(
  'tdd.backend.http.errors',
  {
    description: 'Number of failed backend HTTP requests',
    unit: '{error}',
  },
);

export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  durationMs: number,
): void {
  const attributes = {
    'http.request.method': method,
    'http.route': route,
    'http.response.status_code': statusCode,
  };

  httpRequestCounter.add(1, attributes);
  httpRequestDuration.record(durationMs, attributes);

  if (statusCode >= 400) {
    httpErrorCounter.add(1, attributes);
  }
}