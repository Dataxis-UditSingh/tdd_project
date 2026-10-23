
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestingAgent } from './testing.agent.js';

describe('TestingAgent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns generated test cases', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: 'Use `describe` and `it` to test the function.',
          },
        }),
      }),
    );

    const agent = new TestingAgent();

    const result = await agent.execute({
      agentId: 'testing',
      message: 'Generate Vitest tests for a sum function.',
    });

    expect(result).toEqual({
      agentId: 'testing',
      status: 'success',
      output: 'Use `describe` and `it` to test the function.',
    });
  });

  it('handles an Ollama HTTP failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const agent = new TestingAgent();

    await expect(
      agent.execute({
        agentId: 'testing',
        message: 'Generate tests for a function.',
      }),
    ).rejects.toThrow('Ollama returned HTTP 500');
  });

  it('rejects an empty Ollama response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: '   ',
          },
        }),
      }),
    );

    const agent = new TestingAgent();

    await expect(
      agent.execute({
        agentId: 'testing',
        message: 'Generate tests for a function.',
      }),
    ).rejects.toThrow('Ollama returned an empty response');
  });

  it('handles an Ollama network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network unavailable')),
    );

    const agent = new TestingAgent();

    await expect(
      agent.execute({
        agentId: 'testing',
        message: 'Write unit tests for a function.',
      }),
    ).rejects.toThrow('Network unavailable');
  });

  it('handles an Ollama HTTP failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    const agent = new TestingAgent();

    await expect(
      agent.execute({
        agentId: 'testing',
        message: 'Write unit tests for a function.',
      }),
    ).rejects.toThrow('Ollama returned HTTP 503');
  });
});
