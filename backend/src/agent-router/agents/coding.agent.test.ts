import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodingAgent } from './coding.agent.js';

describe('CodingAgent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a generated coding response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: 'Use Array.map() to transform the array.',
          },
        }),
      }),
    );

    const agent = new CodingAgent();

    const result = await agent.execute({
      agentId: 'coding',
      message: 'How do I transform an array in JavaScript?',
    });

    expect(result).toEqual({
      agentId: 'coding',
      status: 'success',
      output: 'Use Array.map() to transform the array.',
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

    const agent = new CodingAgent();

    await expect(
      agent.execute({
        agentId: 'coding',
        message: 'Explain a function',
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

    const agent = new CodingAgent();

    await expect(
      agent.execute({
        agentId: 'coding',
        message: 'Explain a function',
      }),
    ).rejects.toThrow('Ollama returned an empty response');
  });

  it('handles an Ollama network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network unavailable')),
    );

    const agent = new CodingAgent();

    await expect(
      agent.execute({
        agentId: 'coding',
        message: 'Write a TypeScript function.',
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

    const agent = new CodingAgent();

    await expect(
      agent.execute({
        agentId: 'coding',
        message: 'Write a TypeScript function.',
      }),
    ).rejects.toThrow('Ollama returned HTTP 503');
  });

  
it('aborts the Ollama request when the timeout expires', async () => {
  vi.useFakeTimers();

  try {
    const fetchMock = vi.fn(
      (_url: string, options?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener(
            'abort',
            () => {
              reject(
                new DOMException(
                  'The operation was aborted',
                  'AbortError',
                ),
              );
            },
            { once: true },
          );
        }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const agent = new CodingAgent();

    // Attach rejection handling immediately to prevent an
    // unhandled rejection when the abort signal fires.
    const execution = agent.execute({
      agentId: 'coding',
      message: 'Write a TypeScript function.',
    });

    const assertion = expect(execution).rejects.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.runOnlyPendingTimersAsync();
    await assertion;
  } finally {
    vi.useRealTimers();
  }
});

});