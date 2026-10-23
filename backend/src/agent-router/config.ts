
type AgentRouterProvider = 'none' | 'ollama';

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

function readPositiveNumber(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Expected a positive integer environment value.');
  }

  return parsed;
}

function readProvider(value: string | undefined): AgentRouterProvider {
  const provider = value ?? 'none';

  if (provider !== 'none' && provider !== 'ollama') {
    throw new Error(`Unsupported AGENT_ROUTER_PROVIDER: ${provider}`);
  }

  return provider;
}

export const agentRouterConfig = {
  enabled: readBoolean(process.env.AGENT_ROUTER_ENABLED, true),
  provider: readProvider(process.env.AGENT_ROUTER_PROVIDER),
  defaultAgent: process.env.AGENT_ROUTER_DEFAULT_AGENT ?? 'general',
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL ?? 'llama3.2:3b',
    timeoutMs: readPositiveNumber(
      process.env.OLLAMA_TIMEOUT_MS,
      30_000,
    ),
  },
};
