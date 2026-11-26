import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'tdd-backend';

const traceEndpoint =
  process.env.OTEL_TRACES_ENDPOINT ??
  'http://localhost:4318/v1/traces';

const metricsEndpoint =
  process.env.OTEL_METRICS_ENDPOINT ??
  'http://localhost:4318/v1/metrics';

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: metricsEndpoint,
  }),
  exportIntervalMillis: 5000,
});

const sdk = new NodeSDK({
  serviceName,

  traceExporter: new OTLPTraceExporter({
    url: traceEndpoint,
  }),

  metricReaders: [metricReader],

  textMapPropagator: new W3CTraceContextPropagator(),

  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new UndiciInstrumentation(),
  ],
});

sdk.start();

let shuttingDown = false;

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    await sdk.shutdown();
    console.log('[OTEL] SDK shutdown completed');
  } catch (error) {
    console.error('[OTEL] SDK shutdown failed', error);
    process.exitCode = 1;
  }
}

process.once('SIGTERM', () => void shutdown());
process.once('SIGINT', () => void shutdown());