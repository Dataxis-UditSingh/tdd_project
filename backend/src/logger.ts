
import { trace } from '@opentelemetry/api';
import { ConsoleTransport, LogLayer } from 'loglayer';
import { HttpTransport } from '@loglayer/transport-http';

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'tdd-backend';

const logEndpoint =
  process.env.OTEL_LOGS_ENDPOINT ??
  'http://localhost:4318/v1/logs';

const consoleTransport = new ConsoleTransport({
  logger: console,
  level: 'info',
});

const httpTransport = new HttpTransport({
  url: logEndpoint,
  method: 'POST',
  contentType: 'application/json',
  batchContentType: 'application/json',
  headers: {
    Accept: 'application/json',
  },
  enableBatchSend: false,

  payloadTemplate: ({ logLevel, message, data }) => {
    const spanContext = trace.getActiveSpan()?.spanContext();

    const attributes = [
      {
        key: 'service.name',
        value: { stringValue: serviceName },
      },
      ...Object.entries(data ?? {})
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => ({
          key,
          value: { stringValue: String(value) },
        })),
    ];

    const now = (BigInt(Date.now()) * 1_000_000n).toString();

    const logRecord: Record<string, unknown> = {
      timeUnixNano: now,
      observedTimeUnixNano: now,
      severityText: logLevel.toUpperCase(),
      body: { stringValue: message },
      attributes,
    };

    if (spanContext) {
      logRecord.traceId = spanContext.traceId;
      logRecord.spanId = spanContext.spanId;
    }

    return JSON.stringify({
      resourceLogs: [
        {
          resource: {
            attributes: [
              {
                key: 'service.name',
                value: { stringValue: serviceName },
              },
            ],
          },
          scopeLogs: [
            {
              logRecords: [logRecord],
            },
          ],
        },
      ],
    });
  },

  onDebug: (entry) => {
    console.log('[HTTP TRANSPORT DEBUG]', {
      logLevel: entry.logLevel,
      message: entry.message,
      data: entry.data,
    });
  },

  onDebugReqRes: ({ req, res }) => {
    console.log('\n========== OTLP LOG DELIVERY ==========');
    console.log('Endpoint:', req.url);
    console.log('HTTP Status:', res.status);
    console.log('Status Text:', res.statusText);
    console.log('Response Body:', res.body);
    console.log('=======================================\n');
  },

  onError: (error) => {
    console.error('[HTTP TRANSPORT ERROR]', error);
  },
});

console.log('[OTEL CONFIG]', {
  serviceName,
  logEndpoint,
});

export const logger = new LogLayer({
  transport: [consoleTransport, httpTransport],
});
