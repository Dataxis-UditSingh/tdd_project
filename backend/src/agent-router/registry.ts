import type { AgentDefinition, AgentId } from './types.js';

const definitions: AgentDefinition[] = [
  {
    id: 'coding',
    name: 'Coding Agent',
    description: 'Future agent for code-related requests.',
    status: 'implemented',
  },
  {
    id: 'testing',
    name: 'Testing Agent',
    description: 'Future agent for test creation and test execution requests.',
    status: 'implemented',
  },
  {
    id: 'devops',
    name: 'DevOps Agent',
    description: 'Future agent for infrastructure and deployment requests.',
    status: 'implemented',
  },
  {
    id: 'documentation',
    name: 'Documentation Agent',
    description: 'Future agent for documentation requests.',
    status: 'implemented',
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
