
import { trace } from '@opentelemetry/api';
import { logger } from '../logger.js';

interface ConnectionLog {
    sourceService: string;
    destinationService: string;
    method: string;
    route: string;
    statusCode: number;
    durationMs: number;
    requestId?: string;
}

export function logServiceConnection(data: ConnectionLog): void {
    const spanContext = trace.getActiveSpan()?.spanContext();

    const attributes = {
        'event.name': 'service.connection',
        'source.service': data.sourceService,
        'destination.service': data.destinationService,
        'http.request.method': data.method,
        'http.route': data.route,
        'http.response.status_code': data.statusCode,
        'connection.status': data.statusCode < 400 ? 'success' : 'failure',
        duration_ms: data.durationMs,
        'request.id': data.requestId ?? 'unknown',
        'trace.id': spanContext?.traceId ?? 'unavailable',
    };

    const structuredLogger = logger.withMetadata(attributes);

    if (data.statusCode >= 500) {
        structuredLogger.error('Service connection failed');
    } else if (data.statusCode >= 400) {
        structuredLogger.warn('Service connection failed');
    } else {
        structuredLogger.info('Service connection completed');
    }
}
