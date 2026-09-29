import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';

import { getClientId } from './client-id';

const logEndpoint =
  import.meta.env.VITE_OTEL_LOGS_ENDPOINT ??
  '/v1/logs';

const clientId = getClientId();

const resource = defaultResource().merge(
  resourceFromAttributes({
    'service.name': 'tdd-frontend',
    'client.id': clientId,
  }),
);

const logExporter = new OTLPLogExporter({
  url: logEndpoint,
});

const loggerProvider = new LoggerProvider({
  resource,
  processors: [
    new BatchLogRecordProcessor({
      exporter: logExporter,
    }),
  ],
});

logs.setGlobalLoggerProvider(loggerProvider);

const otelLogger = logs.getLogger('tdd-frontend', '1.0.0');

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  otelLogger.emit({
    severityNumber,
    severityText,
    body: message,
    attributes: {
      'client.id': clientId,
      ...data,
    },
  });

  console.info(message, data);
}

export const logger = {
  info(message: string, data?: Record<string, unknown>): void {
    emit(SeverityNumber.INFO, 'INFO', message, data);
  },

  warn(message: string, data?: Record<string, unknown>): void {
    emit(SeverityNumber.WARN, 'WARN', message, data);
  },

  error(message: string, data?: Record<string, unknown>): void {
    emit(SeverityNumber.ERROR, 'ERROR', message, data);
  },
};