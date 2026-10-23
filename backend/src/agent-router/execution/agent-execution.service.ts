
import { getAgent } from '../registry.js';
import type { AgentExecutor } from './agent.interface.js';
import type {
  AgentExecutionRequest,
  AgentId,
  AgentResult,
} from '../types.js';

export class AgentExecutionService {
  constructor(
    private readonly executors: Partial<
      Record<AgentId, AgentExecutor>
    > = {},
  ) {}

  async execute(
    request: AgentExecutionRequest,
  ): Promise<AgentResult> {
    const agent = getAgent(request.agentId);

    if (!agent) {
      return {
        agentId: request.agentId,
        status: 'error',
        error: 'UNKNOWN_AGENT',
      };
    }

    const executor = this.executors[agent.id];

    if (!executor) {
      return {
        agentId: agent.id,
        status: 'agent_not_implemented',
        error: `${agent.name} is not implemented yet.`,
      };
    }

    try {
      const result = await executor.execute(request);

      // Prevent an executor from returning a result
      // for a different agent.
      if (result.agentId !== agent.id) {
        return {
          agentId: agent.id,
          status: 'error',
          error: 'AGENT_RESULT_ID_MISMATCH',
        };
      }

      return result;
    } catch {
      return {
        agentId: agent.id,
        status: 'error',
        error: 'AGENT_EXECUTION_FAILED',
      };
    }
  }
}
