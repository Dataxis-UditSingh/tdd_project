import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

const traceEndpoint =
  process.env.OTEL_TRACES_ENDPOINT ??
  'http://localhost:4318/v1/traces';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: traceEndpoint,
  }),

  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().catch((error) => {
    console.error('OpenTelemetry shutdown failed', error);
  });
});