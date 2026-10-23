#!/usr/bin/env bash
set -euo pipefail

# Run from the tdd-react-typescript-app repository root.
if [[ ! -f "backend/src/app.ts" || ! -f "backend/package.json" ]]; then
  echo "ERROR: Run this script from the tdd-react-typescript-app repository root."
  exit 1
fi

if ! grep -q "export const app = express();" backend/src/app.ts; then
  echo "ERROR: backend/src/app.ts does not match the expected Express app shape. No changes made."
  exit 1
fi

if grep -q "agentRouterRoutes" backend/src/app.ts; then
  echo "ERROR: Router routes already appear to be mounted in backend/src/app.ts. Review before rerunning."
  exit 1
fi

mkdir -p backend/src/agent-router
mkdir -p backend/src/routes

cat > backend/src/agent-router/types.ts <<'EOF'
export const AGENT_IDS = [
  'coding',
  'testing',
  'devops',
  'documentation',
  'general',
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export type AgentStatus = 'placeholder';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  description: string;
  status: AgentStatus;
}

export interface RouteRequest {
  message: string;
  preferredAgent?: AgentId;
}

export interface RouteDecision {
  requestedAgent: AgentId;
  status: 'agent_not_implemented';
  message: string;
  reason: string;
}
EOF

cat > backend/src/agent-router/config.ts <<'EOF'
function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

const rawDefaultAgent = process.env.AGENT_ROUTER_DEFAULT_AGENT ?? 'general';
const supportedAgentIds = new Set([
  'coding',
  'testing',
  'devops',
  'documentation',
  'general',
]);

export const agentRouterConfig = Object.freeze({
  enabled: readBoolean(process.env.AGENT_ROUTER_ENABLED, true),
  provider: process.env.AGENT_ROUTER_PROVIDER ?? 'none',
  defaultAgent: supportedAgentIds.has(rawDefaultAgent)
    ? rawDefaultAgent
    : 'general',
});
EOF

cat > backend/src/agent-router/registry.ts <<'EOF'
import type { AgentDefinition, AgentId } from './types.js';

const definitions: AgentDefinition[] = [
  {
    id: 'coding',
    name: 'Coding Agent',
    description: 'Future agent for code-related requests.',
    status: 'placeholder',
  },
  {
    id: 'testing',
    name: 'Testing Agent',
    description: 'Future agent for test creation and test execution requests.',
    status: 'placeholder',
  },
  {
    id: 'devops',
    name: 'DevOps Agent',
    description: 'Future agent for infrastructure and deployment requests.',
    status: 'placeholder',
  },
  {
    id: 'documentation',
    name: 'Documentation Agent',
    description: 'Future agent for documentation requests.',
    status: 'placeholder',
  },
  {
    id: 'general',
    name: 'General Agent',
    description: 'Future agent for general questions and requests.',
    status: 'placeholder',
  },
];

const registry = new Map<AgentId, AgentDefinition>(
  definitions.map((agent) => [agent.id, agent]),
);

export function listAgents(): AgentDefinition[] {
  return [...registry.values()];
}

export function getAgent(agentId: string): AgentDefinition | undefined {
  return registry.get(agentId as AgentId);
}
EOF

cat > backend/src/agent-router/router.service.ts <<'EOF'
import { agentRouterConfig } from './config.js';
import { getAgent } from './registry.js';
import type { AgentId, RouteDecision, RouteRequest } from './types.js';

function classifyMessage(message: string): AgentId {
  const text = message.toLowerCase();

  if (/\b(test|tests|testing|vitest|playwright|coverage|spec)\b/.test(text)) {
    return 'testing';
  }

  if (/\b(devops|docker|kubernetes|k8s|helm|flux|tekton|deployment|pipeline|ci\/cd|terraform)\b/.test(text)) {
    return 'devops';
  }

  if (/\b(readme|documentation|document|docs|write guide|explain the architecture)\b/.test(text)) {
    return 'documentation';
  }

  if (/\b(code|coding|bug|debug|function|typescript|javascript|react|refactor|implement|fix)\b/.test(text)) {
    return 'coding';
  }

  return agentRouterConfig.defaultAgent as AgentId;
}

export function routeRequest(input: RouteRequest): RouteDecision {
  if (!agentRouterConfig.enabled) {
    throw new Error('AGENT_ROUTER_DISABLED');
  }

  const selectedId = input.preferredAgent ?? classifyMessage(input.message);
  const agent = getAgent(selectedId);

  if (!agent) {
    throw new Error('UNKNOWN_AGENT');
  }

  return {
    requestedAgent: agent.id,
    status: 'agent_not_implemented',
    message: `The ${agent.name} is registered as a placeholder and is not implemented yet.`,
    reason: input.preferredAgent
      ? 'Agent selected explicitly by the request.'
      : 'Agent selected using the initial keyword-based classifier.',
  };
}
EOF

cat > backend/src/routes/agent-router.routes.ts <<'EOF'
import { Router } from 'express';
import { agentRouterConfig } from '../agent-router/config.js';
import { getAgent, listAgents } from '../agent-router/registry.js';
import { routeRequest } from '../agent-router/router.service.js';
import { AGENT_IDS } from '../agent-router/types.js';

export const agentRouterRoutes = Router();

agentRouterRoutes.get('/status', (_req, res) => {
  res.json({
    enabled: agentRouterConfig.enabled,
    provider: agentRouterConfig.provider,
    mode: 'placeholder',
    agents: listAgents(),
  });
});

agentRouterRoutes.post('/route', (req, res) => {
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

  const decision = routeRequest({
    message: message.trim(),
    ...(preferredAgent ? { preferredAgent } : {}),
  });

  return res.status(200).json(decision);
});
EOF

cat > backend/src/agent-router/README.md <<'EOF'
# AI Agent Router Foundation

This is a configuration and routing foundation only. No real agent execution or LLM calls are implemented.

## Endpoints

- `GET /api/agent-router/status` — reports router configuration and placeholder agents.
- `POST /api/agent-router/route` — selects an agent using simple keyword rules or `preferredAgent`, then returns `agent_not_implemented`.

Example request:

```json
{
  "message": "Help me debug this React component"
}
```

Example explicit selection:

```json
{
  "message": "Please handle this request",
  "preferredAgent": "testing"
}
```

Supported IDs: `coding`, `testing`, `devops`, `documentation`, `general`.

## Environment

Copy the following variables into your local environment if desired. Defaults are safe for local development.

```dotenv
AGENT_ROUTER_ENABLED=true
AGENT_ROUTER_PROVIDER=none
AGENT_ROUTER_DEFAULT_AGENT=general
```

`AGENT_ROUTER_PROVIDER=none` means no LLM provider is connected. Routing currently uses a small keyword classifier. The provider setting is reserved for a future adapter; changing it does not connect a model.

## Future integration

1. Implement an LLM provider adapter behind a typed interface.
2. Add structured classification with schema validation and a timeout.
3. Implement agents behind a common interface and register them in `registry.ts`.
4. Add explicit permissions and approval gates before allowing tools, filesystem writes, shell commands, or deployments.
5. Add provider and agent integration tests before enabling execution.

Do not put secrets in source control or log user prompts by default.
EOF

cat > backend/src/agent-router/agent-router.test.ts <<'EOF'
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';

describe('AI Agent Router foundation', () => {
  it('reports placeholder agents and configuration', async () => {
    const response = await request(app).get('/api/agent-router/status');

    expect(response.status).toBe(200);
    expect(response.body.mode).toBe('placeholder');
    expect(response.body.agents.map((agent: { id: string }) => agent.id)).toEqual([
      'coding',
      'testing',
      'devops',
      'documentation',
      'general',
    ]);
  });

  it('routes a coding request without executing an agent', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: 'Help me debug a React component' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      requestedAgent: 'coding',
      status: 'agent_not_implemented',
    });
  });

  it('allows explicit selection of a registered placeholder', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: 'Please review this', preferredAgent: 'testing' });

    expect(response.status).toBe(200);
    expect(response.body.requestedAgent).toBe('testing');
    expect(response.body.status).toBe('agent_not_implemented');
  });

  it('rejects an empty message', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: '  ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_REQUEST');
  });

  it('rejects unsupported agent IDs', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: 'Do this', preferredAgent: 'admin' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('UNKNOWN_AGENT');
  });

  it('rejects excessively long messages', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: 'x'.repeat(10_001) });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('MESSAGE_TOO_LONG');
  });
});
EOF

# Mount the new routes without replacing existing routes.
python3 <<'PY'
from pathlib import Path
path = Path("backend/src/app.ts")
source = path.read_text()
import_line = "import { agentRouterRoutes } from './routes/agent-router.routes.js';"
if import_line not in source:
    marker = "import { requestLogger } from './middleware/request-logger.js';"
    if marker not in source:
        raise SystemExit("Could not find expected import marker in backend/src/app.ts; no app.ts changes made.")
    source = source.replace(marker, marker + "\n" + import_line, 1)

mount_line = "app.use('/api/agent-router', agentRouterRoutes);"
if mount_line not in source:
    marker = "app.use(requestLogger);"
    if marker not in source:
        raise SystemExit("Could not find expected middleware marker in backend/src/app.ts; no app.ts changes made.")
    source = source.replace(marker, marker + "\napp.use('/api/agent-router', agentRouterRoutes);", 1)

path.write_text(source)
PY

cat > backend/.env.agent-router.example <<'EOF'
# Optional AI Agent Router settings
AGENT_ROUTER_ENABLED=true
AGENT_ROUTER_PROVIDER=none
AGENT_ROUTER_DEFAULT_AGENT=general
EOF

echo
echo "AI Agent Router foundation files created."
echo "Next run:"
echo "  npm run test --workspace backend"
echo "  npm run build --workspace backend"
