import { Router } from 'express';
import { agentRouterConfig } from '../agent-router/config.js';
import { getAgent, listAgents } from '../agent-router/registry.js';
import { AGENT_IDS } from '../agent-router/types.js';
import { routeAndExecute, routeRequest} from '../agent-router/router.service.js';

export const agentRouterRoutes = Router();

agentRouterRoutes.get('/status', (_req, res) => {
  res.json({
    enabled: agentRouterConfig.enabled,
    provider: agentRouterConfig.provider,
    mode: 'placeholder',
    agents: listAgents(),
  });
});

agentRouterRoutes.post('/route', async (req, res) => {
  const { message, preferredAgent } = req.body ?? {};

  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'The message field must be a non-empty string.',
    });
  }

  if (message.length > 10_000) {
    return res.status(400).json({
      error: 'MESSAGE_TOO_LONG',
      message: 'The message must be 10000 characters or fewer.',
    });
  }

  if (
    preferredAgent !== undefined &&
    (typeof preferredAgent !== 'string' ||
      !AGENT_IDS.includes(preferredAgent as (typeof AGENT_IDS)[number]))
  ) {
    return res.status(400).json({
      error: 'UNKNOWN_AGENT',
      message: 'preferredAgent must be a supported agent ID.',
      supportedAgents: AGENT_IDS,
    });
  }

  if (preferredAgent && !getAgent(preferredAgent)) {
    return res.status(400).json({
      error: 'UNKNOWN_AGENT',
      message: 'The requested agent is not registered.',
    });
  }

  if (!agentRouterConfig.enabled) {
    return res.status(503).json({
      error: 'AGENT_ROUTER_DISABLED',
      message: 'The agent router is disabled by configuration.',
    });
  }

  const decision = await routeRequest({
    message: message.trim(),
    ...(preferredAgent ? { preferredAgent } : {}),
  });

  return res.status(200).json(decision);
});


agentRouterRoutes.post('/execute', async (req, res) => {
  try {
    const { message, preferredAgent } = req.body ?? {};

    if (
      typeof message !== 'string' ||
      message.trim().length === 0 ||
      message.length > 4000
    ) {
      res.status(400).json({
        error: 'INVALID_MESSAGE',
      });
      return;
    }

    if (preferredAgent !== undefined) {
      const agent = getAgent(preferredAgent);

      if (!agent) {
        res.status(400).json({
          error: 'UNKNOWN_AGENT',
        });
        return;
      }
    }

    const result = await routeAndExecute({
      message,
      preferredAgent,
    });

    res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'AGENT_ROUTER_DISABLED'
    ) {
      res.status(503).json({
        error: 'AGENT_ROUTER_DISABLED',
      });
      return;
    }

    res.status(500).json({
      error: 'AGENT_EXECUTION_REQUEST_FAILED',
    });
  }
});


