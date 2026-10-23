
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentationAgent } from './documentation.agent.js';

describe('DocumentationAgent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns generated technical documentation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: '# Project Setup\n\nRun `npm install` to install dependencies.',
          },
        }),
      }),
    );

    const agent = new DocumentationAgent();

    const result = await agent.execute({
      agentId: 'documentation',
      message: 'Write a short project setup guide.',
    });

    expect(result).toEqual({
      agentId: 'documentation',
      status: 'success',
      output: '# Project Setup\n\nRun `npm install` to install dependencies.',
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

    const agent = new DocumentationAgent();

    await expect(
      agent.execute({
        agentId: 'documentation',
        message: 'Document this API.',
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

    const agent = new DocumentationAgent();

    await expect(
      agent.execute({
        agentId: 'documentation',
        message: 'Document this API.',
      }),
    ).rejects.toThrow('Ollama returned an empty response');
  });

  it('handles an Ollama network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network unavailable')),
    );

    const agent = new DocumentationAgent();

    await expect(
      agent.execute({
        agentId: 'documentation',
        message: 'Write a README for the project.',
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

    const agent = new DocumentationAgent();

    await expect(
      agent.execute({
        agentId: 'documentation',
        message: 'Write a README for the project.',
      }),
    ).rejects.toThrow('Ollama returned HTTP 503');
  });
});
