import type { Challenge } from './types';
import { logger } from './logger';
import { recordApiRequest } from './metrics';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function getChallenges(): Promise<Challenge[]> {
  const url = `${API_BASE_URL}/api/challenges`;
  const startedAt = Date.now();

  logger.info(`Frontend API request started: GET ${url}`);

  try {
    const response = await fetch(url);
    const durationMs = Date.now() - startedAt;

    recordApiRequest(
      'GET',
      '/api/challenges',
      response.status,
      durationMs,
    );

    if (!response.ok) {
      logger.warn(
        `Frontend API request failed: GET ${url} status=${response.status} durationMs=${durationMs}`,
      );

      throw new Error('Unable to load challenges');
    }

    logger.info(
      `Frontend API request completed: GET ${url} status=${response.status} durationMs=${durationMs}`,
    );

    return response.json();
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    if (
      error instanceof Error &&
      error.message === 'Unable to load challenges'
    ) {
      throw error;
    }

    logger.error(
      `Frontend API request error: GET ${url} durationMs=${durationMs}`,
    );

    throw error;
  }
}

export async function getChallenge(id: string): Promise<Challenge> {
  const url = `${API_BASE_URL}/api/challenges/${id}`;
  const startedAt = Date.now();

  logger.info(`Frontend API request started: GET ${url}`);

  try {
    const response = await fetch(url);
    const durationMs = Date.now() - startedAt;

    recordApiRequest(
      'GET',
      `/api/challenges/${id}`,
      response.status,
      durationMs,
    );

    if (response.status === 404) {
      logger.warn(
        `Frontend API request failed: GET ${url} status=404 durationMs=${durationMs}`,
      );

      throw new Error('Challenge not found');
    }

    if (!response.ok) {
      logger.warn(
        `Frontend API request failed: GET ${url} status=${response.status} durationMs=${durationMs}`,
      );

      throw new Error('Unable to load challenge');
    }

    logger.info(
      `Frontend API request completed: GET ${url} status=${response.status} durationMs=${durationMs}`,
    );

    return response.json();
  } catch (error) {
    const isExpectedHttpError =
      error instanceof Error &&
      (
        error.message === 'Challenge not found' ||
        error.message === 'Unable to load challenge'
      );

    if (!isExpectedHttpError) {
      const durationMs = Date.now() - startedAt;

      logger.error(
        `Frontend API request error: GET ${url} durationMs=${durationMs}`,
      );
    }

    throw error;
  }
}


export type AgentId =
  | 'coding'
  | 'testing'
  | 'devops'
  | 'documentation'
  | 'general';

export interface AgentExecutionResponse {
  routing: {
    requestedAgent: AgentId;
    status: 'ready' | 'agent_not_implemented';
    message: string;
    reason: string;
  };
  execution: {
    agentId: AgentId;
    status: 'success' | 'error' | 'agent_not_implemented';
    output?: string;
    error?: string;
  };
}

export async function executeAgent(
  message: string,
  preferredAgent?: AgentId,
): Promise<AgentExecutionResponse> {
  const url = `${API_BASE_URL}/api/agent-router/execute`;
  const startedAt = Date.now();

  logger.info(`Frontend API request started: POST ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        ...(preferredAgent ? { preferredAgent } : {}),
      }),
    });

    const durationMs = Date.now() - startedAt;

    recordApiRequest(
      'POST',
      '/api/agent-router/execute',
      response.status,
      durationMs,
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);

      throw new Error(
        typeof errorBody?.message === 'string'
          ? errorBody.message
          : typeof errorBody?.error === 'string'
            ? errorBody.error
            : 'Unable to execute the agent request.',
      );
    }

    logger.info(
      `Frontend API request completed: POST ${url} status=${response.status} durationMs=${durationMs}`,
    );

    return (await response.json()) as AgentExecutionResponse;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        `Frontend API request error: POST ${url} durationMs=${Date.now() - startedAt}`,
      );
      throw error;
    }

    throw new Error('Unable to connect to the Agent Router.');
  }
}
