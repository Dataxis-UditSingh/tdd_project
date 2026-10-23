
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DevOpsAgent } from './devops.agent.js';

describe('DevOpsAgent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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

    const agent = new DevOpsAgent();

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
      }),
    );

    const agent = new DevOpsAgent();

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

    const agent = new DevOpsAgent();

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

    const result = await new DevOpsAgent().execute({
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

    const result = await new DevOpsAgent().execute({
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

    await expect(
      new DevOpsAgent().execute({
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
      });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      new DevOpsAgent().execute({
        agentId: 'devops',
        message: 'Generate YAML.',
      }),
    ).rejects.toThrow('Ollama correction returned HTTP 500');
  });

});
