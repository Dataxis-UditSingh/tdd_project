
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentationAgent } from './documentation.agent.js';

async function createOllamaDocumentationAgent() {
  vi.resetModules();
  vi.stubEnv('AGENT_ROUTER_PROVIDER', 'ollama');

  const { DocumentationAgent } = await import('./documentation.agent.js');
  return new DocumentationAgent();
}

describe('DocumentationAgent', () => {
  afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.resetModules();
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

    const agent = await createOllamaDocumentationAgent();

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
        statusText: 'Internal Server Error',
        text: async () => 'Internal Server Error',
      }),
    );

    const agent = await createOllamaDocumentationAgent();

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

    const agent = await createOllamaDocumentationAgent();

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

    const agent = await createOllamaDocumentationAgent();

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
        statusText: 'Service Unavailable',
        text: async () => 'Service Unavailable',
      }),
    );

    const agent = await createOllamaDocumentationAgent();

    await expect(
      agent.execute({
        agentId: 'documentation',
        message: 'Write a README for the project.',
      }),
    ).rejects.toThrow('Ollama returned HTTP 503');
  });
});
