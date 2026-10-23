import { agentRouterConfig } from './config.js';
import { getAgent } from './registry.js';
import { classifyWithOllama } from './ollama.classifier.js';
import type { AgentId, RouteDecision, RouteRequest } from './types.js';
import { AgentExecutionService } from './execution/agent-execution.service.js';
import type { AgentResult } from './types.js';
import { CodingAgent } from './agents/coding.agent.js';
import { TestingAgent } from './agents/testing.agent.js';
import { DocumentationAgent } from './agents/documentation.agent.js';
import { DevOpsAgent } from './agents/devops.agent.js';

function classifyMessage(message: string): AgentId {
  const text = message.toLowerCase();

  if (/\b(test|tests|testing|vitest|playwright|coverage|spec)\b/.test(text)) {
    return 'testing';
  }

  if (
    /\b(devops|docker|kubernetes|k8s|helm|flux|tekton|deployment|pipeline|ci\/cd|terraform)\b/.test(
      text,
    )
  ) {
    return 'devops';
  }

  if (
    /\b(readme|documentation|document|docs|write guide|explain the architecture)\b/.test(
      text,
    )
  ) {
    return 'documentation';
  }

  if (
    /\b(code|coding|bug|debug|function|typescript|javascript|react|refactor|implement|fix)\b/.test(
      text,
    )
  ) {
    return 'coding';
  }

  return agentRouterConfig.defaultAgent as AgentId;
}

export async function routeRequest(
  input: RouteRequest,
): Promise<RouteDecision> {
  if (!agentRouterConfig.enabled) {
    throw new Error('AGENT_ROUTER_DISABLED');
  }

  let selectedId: AgentId;
  let reason: string;

  if (input.preferredAgent) {
    selectedId = input.preferredAgent;
    reason = 'Agent selected explicitly by the request.';
  } else if (agentRouterConfig.provider === 'ollama') {
    try {
      selectedId = await classifyWithOllama(input.message);
      reason = 'Agent selected using the Ollama classifier.';
    } catch (error) {
      console.error(
        'Ollama classification failed; using keyword fallback.',
        error instanceof Error ? error.message : 'Unknown error',
      );

      selectedId = classifyMessage(input.message);
      reason =
        'Ollama classification failed; used the keyword-based fallback.';
    }
  } else {
    selectedId = classifyMessage(input.message);
    reason = 'Agent selected using the initial keyword-based classifier.';
  }

  const agent = getAgent(selectedId);

  if (!agent) {
    throw new Error('UNKNOWN_AGENT');
  }

  return {
    requestedAgent: agent.id,
    status:
      agent.status === 'implemented'
        ? 'ready'
        : 'agent_not_implemented',
    message:
      agent.status === 'implemented'
        ? `${agent.name} is implemented and ready to execute.`
        : `${agent.name} is registered as a placeholder and is not implemented yet.`,
    reason,
  };
}

const agentExecutionService = new AgentExecutionService({
  coding: new CodingAgent(),
  testing: new TestingAgent(),
  documentation: new DocumentationAgent(),
  devops: new DevOpsAgent(),
});

export interface RouteExecutionResult {
  routing: RouteDecision;
  execution: AgentResult;
}

export async function routeAndExecute(
  input: RouteRequest,
): Promise<RouteExecutionResult> {
  // Step 1: Select the agent using the existing router.
  const routing = await routeRequest(input);

  // Step 2: Pass the selected agent to the execution engine.
  const execution = await agentExecutionService.execute({
    agentId: routing.requestedAgent,
    message: input.message,
  });

  return {
    routing,
    execution,
  };
}