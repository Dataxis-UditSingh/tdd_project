
import { Router } from 'express';
import { agentRouterConfig } from '../agent-router/config.js';
import { getAgent, listAgents } from '../agent-router/registry.js';
import { AGENT_IDS } from '../agent-router/types.js';
import {
  routeAndExecute,
  routeRequest,
} from '../agent-router/router.service.js';

export const agentRouterRoutes = Router();

const MAX_MESSAGE_LENGTH = 10_000;

function validateRequest(body: unknown):
  | { valid: true; message: string; preferredAgent?: (typeof AGENT_IDS)[number] }
  | { valid: false; status: number; error: string; message: string } {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      status: 400,
      error: 'INVALID_REQUEST',
      message: 'A JSON request body is required.',
    };
  }

  const input = body as Record<string, unknown>;
  const { message, preferredAgent } = input;

  if (typeof message !== 'string' || message.trim().length === 0) {
    return {
      valid: false,
      status: 400,
      error: 'INVALID_REQUEST',
      message: 'The message field must be a non-empty string.',
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      status: 400,
      error: 'MESSAGE_TOO_LONG',
      message: `The message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    };
  }

  if (
    preferredAgent !== undefined &&
    (typeof preferredAgent !== 'string' ||
      !AGENT_IDS.includes(preferredAgent as (typeof AGENT_IDS)[number]))
  ) {
    return {
      valid: false,
      status: 400,
      error: 'UNKNOWN_AGENT',
      message: 'preferredAgent must be a supported agent ID.',
    };
  }

  if (typeof preferredAgent === 'string' && !getAgent(preferredAgent as (typeof AGENT_IDS)[number])) {
    return {
      valid: false,
      status: 400,
      error: 'UNKNOWN_AGENT',
      message: 'The requested agent is not registered.',
    };
  }

  return {
    valid: true,
    message: message.trim(),
    ...(preferredAgent !== undefined
      ? { preferredAgent: preferredAgent as (typeof AGENT_IDS)[number] }
      : {}),
  };
}

agentRouterRoutes.get('/status', (_req, res) => {
  const agents = listAgents();
  const implementedCount = agents.filter(
    (agent) => agent.status === 'implemented',
  ).length;

  const mode =
    implementedCount === 0
      ? 'placeholder'
      : implementedCount === agents.length
        ? 'active'
        : 'mixed';

  res.json({
    enabled: agentRouterConfig.enabled,
    provider: agentRouterConfig.provider,
    mode,
    agents,
  });
});

agentRouterRoutes.post('/route', async (req, res) => {
  const validated = validateRequest(req.body);

  if (!validated.valid) {
    return res.status(validated.status).json({
      error: validated.error,
      message: validated.message,
    });
  }

  if (!agentRouterConfig.enabled) {
    return res.status(503).json({
      error: 'AGENT_ROUTER_DISABLED',
      message: 'The agent router is disabled by configuration.',
    });
  }

  try {
    const decision = await routeRequest({
      message: validated.message,
      ...(validated.preferredAgent
        ? { preferredAgent: validated.preferredAgent }
        : {}),
    });

    return res.status(200).json(decision);
  } catch {
    return res.status(500).json({
      error: 'AGENT_ROUTING_REQUEST_FAILED',
    });
  }
});

agentRouterRoutes.post('/execute', async (req, res) => {
  const validated = validateRequest(req.body);

  if (!validated.valid) {
    return res.status(validated.status).json({
      error: validated.error,
      message: validated.message,
    });
  }

  if (!agentRouterConfig.enabled) {
    return res.status(503).json({
      error: 'AGENT_ROUTER_DISABLED',
      message: 'The agent router is disabled by configuration.',
    });
  }

  try {
    const result = await routeAndExecute({
      message: validated.message,
      ...(validated.preferredAgent
        ? { preferredAgent: validated.preferredAgent }
        : {}),
    });

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({
      error: 'AGENT_EXECUTION_REQUEST_FAILED',
    });
  }
});
