
export const AGENT_IDS = [
  'coding',
  'testing',
  'devops',
  'documentation',
  'general',
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export type AgentStatus = 'implemented' | 'placeholder';

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
  status: 'ready' | 'agent_not_implemented';
  message: string;
  reason: string;
}

// Input provided to an agent executor.
export interface AgentExecutionRequest {
  agentId: AgentId;
  message: string;
}

// Standard result returned by the execution engine.
export type AgentResultStatus =
  | 'success'
  | 'error'
  | 'agent_not_implemented';

export interface AgentResult {
  agentId: AgentId;
  status: AgentResultStatus;
  output?: string;
  error?: string;
}
