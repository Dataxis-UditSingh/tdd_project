import { trace } from '@opentelemetry/api';
import { ConsoleTransport, LogLayer } from 'loglayer';
import { HttpTransport } from '@loglayer/transport-http';

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
    const activeSpan = trace.getActiveSpan();
    const spanContext = activeSpan?.spanContext();

    const attributes = [
      {
        key: 'service.name',
        value: {
          stringValue: 'tdd-backend',
        },
      },

      {
        key: 'trace.id',
        value: {
          stringValue: spanContext?.traceId ?? '',
        },
      },

      {
        key: 'span.id',
        value: {
          stringValue: spanContext?.spanId ?? '',
        },
      },
    ];

    if (data) {
      attributes.push(
        ...Object.entries(data).map(([key, value]) => ({
          key,
          value: {
            stringValue: String(value),
          },
        })),
      );
    }

    return JSON.stringify({
      resourceLogs: [
        {
          resource: {
            attributes: [
              {
                key: 'service.name',
                value: {
                  stringValue: 'tdd-backend',
                },
              },
            ],
          },
          scopeLogs: [
            {
              logRecords: [
                {
                  timeUnixNano: String(Date.now() * 1_000_000),

                  severityText: logLevel.toUpperCase(),

                  body: {
                    stringValue: message,
                  },

                  attributes,
                },
              ],
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
    console.log('[HTTP REQUEST]', {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    console.log('[HTTP RESPONSE]', {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
      body: res.body,
    });
  },

  onError: (error) => {
    console.error('[HTTP TRANSPORT ERROR]', error);
  },
});

export const logger = new LogLayer({
  transport: [consoleTransport, httpTransport],
});