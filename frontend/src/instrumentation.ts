import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';

import { getClientId } from './client-id';

const traceEndpoint =
  import.meta.env.VITE_OTEL_TRACES_ENDPOINT ??
  '/v1/traces';

const clientId = getClientId();

const resource = defaultResource().merge(
  resourceFromAttributes({
    'service.name': 'tdd-frontend',
    'client.id': clientId,
  }),
);

const traceExporter = new OTLPTraceExporter({
  url: traceEndpoint,
});

const provider = new WebTracerProvider({
  resource,
  spanProcessors: [
    new BatchSpanProcessor(traceExporter),
  ],
});

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [
        /\/v1\/logs$/,
        /\/v1\/traces$/,
      ],
      propagateTraceHeaderCorsUrls: [
        /localhost:4000/,
      ],
      applyCustomAttributesOnSpan: (span) => {
        span.setAttribute('client.id', clientId);
      },
    }),
  ],
});