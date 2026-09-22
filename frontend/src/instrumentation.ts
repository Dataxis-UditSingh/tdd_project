import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';

const traceEndpoint =
  import.meta.env.VITE_OTEL_TRACES_ENDPOINT ??
  'http://192.168.29.225:4318/v1/traces';

const traceExporter = new OTLPTraceExporter({
  url: traceEndpoint,
});

const provider = new WebTracerProvider({
  spanProcessors: [
    // Use batch processing so the browser doesn't make
    // one export request for every span.
    // We'll keep the default processor configuration here.
    // The exporter sends to the external OTLP endpoint.
  ],
});

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: [
        /192\.168\.29\.225:4318/,
        /localhost:4000/,
      ],
    }),
  ],
});