
import { describe, expect, it, vi } from 'vitest';
import { AgentExecutionService } from './agent-execution.service.js';
import type { AgentExecutor } from './agent.interface.js';

describe('AgentExecutionService', () => {
  it('returns not implemented for a placeholder agent', async () => {
    const service = new AgentExecutionService();

    await expect(
      service.execute({
        agentId: 'coding',
        message: 'Debug my React component',
      }),
    ).resolves.toMatchObject({
      agentId: 'coding',
      status: 'agent_not_implemented',
    });
  });

  it('executes a registered executor', async () => {
    const executor: AgentExecutor = {
      execute: vi.fn().mockResolvedValue({
        agentId: 'coding',
        status: 'success',
        output: 'Example result',
      }),
    };

    const service = new AgentExecutionService({
      coding: executor,
    });

    const result = await service.execute({
      agentId: 'coding',
      message: 'Explain this function',
    });

    expect(result).toEqual({
      agentId: 'coding',
      status: 'success',
      output: 'Example result',
    });

    expect(executor.execute).toHaveBeenCalledWith({
      agentId: 'coding',
      message: 'Explain this function',
    });
  });

  it('handles executor failures', async () => {
    const executor: AgentExecutor = {
      execute: vi.fn().mockRejectedValue(
        new Error('Internal details'),
      ),
    };

    const service = new AgentExecutionService({
      coding: executor,
    });

    await expect(
      service.execute({
        agentId: 'coding',
        message: 'Explain this function',
      }),
    ).resolves.toEqual({
      agentId: 'coding',
      status: 'error',
      error: 'AGENT_EXECUTION_FAILED',
    });
  });

  it('rejects a result for the wrong agent', async () => {
    const executor: AgentExecutor = {
      execute: vi.fn().mockResolvedValue({
        agentId: 'testing',
        status: 'success',
        output: 'Incorrect agent result',
      }),
    };

    const service = new AgentExecutionService({
      coding: executor,
    });

    await expect(
      service.execute({
        agentId: 'coding',
        message: 'Debug my application',
      }),
    ).resolves.toEqual({
      agentId: 'coding',
      status: 'error',
      error: 'AGENT_RESULT_ID_MISMATCH',
    });
  });
});
