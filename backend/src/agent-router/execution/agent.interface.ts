
import type {
  AgentExecutionRequest,
  AgentResult,
} from '../types.js';

export interface AgentExecutor {
  execute(
    request: AgentExecutionRequest,
  ): Promise<AgentResult>;
}
