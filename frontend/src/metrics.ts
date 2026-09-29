import { metrics } from '@opentelemetry/api';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';

const metricsEndpoint =
  import.meta.env.VITE_OTEL_METRICS_ENDPOINT ??
  '/v1/metrics';

const resource = defaultResource().merge(
  resourceFromAttributes({
    'service.name': 'tdd-frontend',
  }),
);

const metricExporter = new OTLPMetricExporter({
  url: metricsEndpoint,
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 5000,
});

export const meterProvider = new MeterProvider({
  resource,
  readers: [metricReader],
});

metrics.setGlobalMeterProvider(meterProvider);

const meter = metrics.getMeter('tdd-frontend', '1.0.0');

export const apiRequestCounter = meter.createCounter(
  'tdd.frontend.api.requests',
  {
    description: 'Number of frontend API requests',
    unit: '{request}',
  },
);

export const apiRequestDuration = meter.createHistogram(
  'tdd.frontend.api.request.duration',
  {
    description: 'Frontend API request duration',
    unit: 'ms',
  },
);

export const apiErrorCounter = meter.createCounter(
  'tdd.frontend.api.errors',
  {
    description: 'Number of failed frontend API requests',
    unit: '{error}',
  },
);

const manualTestCounter = meter.createCounter(
  'tdd.frontend.metrics.test',
  {
    description: 'Temporary metric used to verify OTLP metrics export',
    unit: '{test}',
  },
);

export function recordApiRequest(
  method: string,
  endpoint: string,
  statusCode: number,
  durationMs: number,
): void {
  const attributes = {
    'http.request.method': method,
    'api.endpoint': endpoint,
    'http.response.status_code': statusCode,
  };

  apiRequestCounter.add(1, attributes);
  apiRequestDuration.record(durationMs, attributes);

  if (statusCode >= 400) {
    apiErrorCounter.add(1, attributes);
  }
}

export async function exportTestMetric(): Promise<void> {
  manualTestCounter.add(1, {
    test: 'manual',
  });

  await meterProvider.forceFlush();

  console.log('OTel metrics test export completed');
}

if (import.meta.env.DEV) {
  (
    window as typeof window & {
      __exportOtelMetrics?: () => Promise<void>;
    }
  ).__exportOtelMetrics = exportTestMetric;
}