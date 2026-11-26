
import { afterEach, describe, expect, it, vi } from 'vitest';
async function createOllamaDevOpsAgent() {
  vi.resetModules();
  vi.stubEnv('AGENT_ROUTER_PROVIDER', 'ollama');

  const { DevOpsAgent } = await import('./devops.agent.js');
  return new DevOpsAgent();
}

describe('DevOpsAgent', () => {
  afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.resetModules();
});

  it('returns generated DevOps guidance', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: 'Use a Kubernetes Deployment to manage application replicas.',
          },
        }),
      }),
    );

    const agent = await createOllamaDevOpsAgent();

    const result = await agent.execute({
      agentId: 'devops',
      message: 'Explain how Kubernetes Deployments work.',
    });

    expect(result).toEqual({
      agentId: 'devops',
      status: 'success',
      output: 'Use a Kubernetes Deployment to manage application replicas.',
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

    const agent = await createOllamaDevOpsAgent();

    await expect(
      agent.execute({
        agentId: 'devops',
        message: 'Help troubleshoot a deployment.',
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

    const agent = await createOllamaDevOpsAgent();

    await expect(
      agent.execute({
        agentId: 'devops',
        message: 'Explain Docker networking.',
      }),
    ).rejects.toThrow('Ollama returned an empty response');
  });

  it('returns valid YAML without requesting a correction', async () => {
    const validYaml = [
      '```yaml',
      'apiVersion: v1',
      'kind: Service',
      'metadata:',
      '  name: demo',
      '```',
    ].join('\n');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: validYaml } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const agent = await createOllamaDevOpsAgent();
    const result = await agent.execute({
      agentId: 'devops',
      message: 'Generate a Kubernetes Service YAML.',
    });

    expect(result.output).toBe(validYaml);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('requests a correction when YAML is malformed', async () => {
    const malformedYaml = [
      '```yaml',
      'metadata:',
      '  name: [invalid',
      '```',
    ].join('\n');

    const correctedYaml = [
      '```yaml',
      'metadata:',
      '  name: valid',
      '```',
    ].join('\n');

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: { content: malformedYaml } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: { content: correctedYaml } }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const agent = await createOllamaDevOpsAgent();
    const result = await agent.execute({
      agentId: 'devops',
      message: 'Generate YAML.',
    });

    expect(result.output).toBe(correctedYaml);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects YAML that remains invalid after correction', async () => {
    const malformedYaml = [
      '```yaml',
      'metadata:',
      '  name: [invalid',
      '```',
    ].join('\n');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: malformedYaml } }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const agent = await createOllamaDevOpsAgent();
    await expect(
      agent.execute({
        agentId: 'devops',
        message: 'Generate YAML.',
      }),
    ).rejects.toThrow('Generated YAML is invalid');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('handles an HTTP failure during YAML correction', async () => {
    const malformedYaml = [
      '```yaml',
      'metadata:',
      '  name: [invalid',
      '```',
    ].join('\n');

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: { content: malformedYaml } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Internal Server Error',
      });

    vi.stubGlobal('fetch', fetchMock);

    const agent = await createOllamaDevOpsAgent();
    await expect(
      agent.execute({
        agentId: 'devops',
        message: 'Generate YAML.',
      }),
    ).rejects.toThrow('Ollama returned HTTP 500');
  });

});
